import { createHash, randomBytes } from 'node:crypto';
import { z } from 'zod';
import { completeAccountSchema, emptyCommandSchema, type SessionDTO } from '@social/contracts';
import {
  accountSchema,
  privateIdentitySchema,
  ApiError,
  assessDeclaredAge,
  requireAccessible,
  toSession,
  type Account,
  type Principal,
} from './domain/account.js';
import type { Store } from './platform/store.js';

export type Operation = 'bootstrap' | 'state' | 'complete' | 'revoke';
export const digest = (value: string): string => createHash('sha256').update(value).digest('hex');
const sessionRecordSchema = z.strictObject({
  version: z.number().int().nonnegative(),
  authTime: z.number().int().positive(),
  expiresAt: z.number().int().nonnegative(),
});
const lineageSchema = z.strictObject({ version: z.number().int().nonnegative() });
const limitSchema = z.strictObject({
  window: z.number().int(),
  count: z.number().int().nonnegative(),
});
const receiptSchema = z.strictObject({ operation: z.literal('complete') });
export interface ServiceResult {
  session: SessionDTO;
  sessionToken?: string;
}
export function createAccountService(store: Store, now: () => number = Date.now) {
  return async (
    operation: Operation,
    actor: Principal,
    body: unknown,
    sessionToken?: string,
  ): Promise<ServiceResult> => {
    const command =
      operation === 'complete'
        ? completeAccountSchema.safeParse(body)
        : emptyCommandSchema.safeParse(body);
    if (!command.success) throw new ApiError(400, 'invalid_request');
    const completed =
      operation === 'complete' ? completeAccountSchema.parse(command.data) : undefined;
    const time = now();
    if (actor.authTime > Math.floor(time / 1000) + 30) throw new ApiError(401, 'unauthenticated');
    const key = digest(actor.uid);
    const accountPath = 'accounts/' + key;
    const identityPath = 'identities/' + key;
    const newToken = operation === 'bootstrap' ? randomBytes(32).toString('base64url') : undefined;
    if (operation !== 'bootstrap' && !/^[A-Za-z0-9_-]{43}$/.test(sessionToken ?? '')) {
      throw new ApiError(401, 'unauthenticated');
    }
    const sessionPath = accountPath + '/sessions/' + digest(newToken ?? sessionToken ?? '');
    const lineagePath = accountPath + '/authSessions/' + String(actor.authTime);
    const limitPath = accountPath + '/rateLimits/' + operation;
    const receiptPath = accountPath + '/operations/' + digest(completed?.requestKey ?? 'unused');
    // Count authenticated attempts independently; a rejected mutation must not roll the counter back.
    await store.transact(async (tx) => {
      const raw = await tx.get(limitPath);
      const window = Math.floor(time / 60_000);
      const limit = raw === undefined ? undefined : limitSchema.parse(raw);
      const count = limit?.window === window ? limit.count : 0;
      const maximum = { bootstrap: 6, state: 30, complete: 5, revoke: 5 }[operation];
      if (count >= maximum) throw new ApiError(429, 'rate_limited');
      tx.set(limitPath, { window, count: count + 1 });
    });
    return store.transact(async (tx) => {
      // All reads precede writes. Account is re-read in the transaction, never from claims/cache.
      const [rawAccount, rawIdentity, rawSession, rawLineage, rawReceipt] = await Promise.all([
        tx.get(accountPath),
        tx.get(identityPath),
        tx.get(sessionPath),
        tx.get(lineagePath),
        tx.get(receiptPath),
      ]);
      const identity =
        rawIdentity === undefined ? undefined : privateIdentitySchema.parse(rawIdentity);
      const account: Account =
        rawAccount === undefined
          ? {
              accountRef: 'acc_' + randomBytes(24).toString('base64url'),
              accountStatus: 'pending',
              eligibilityStatus: 'pending',
              emailVerificationStatus: actor.emailVerified ? 'verified' : 'pending',
              identityVerificationStatus: 'not_started',
              sessionVersion: 0,
              authValidAfter: 0,
              createdAt: time,
              updatedAt: time,
            }
          : accountSchema.parse(rawAccount);
      if (rawAccount === undefined && operation !== 'bootstrap')
        throw new ApiError(401, 'unauthenticated');
      requireAccessible(account);
      if (actor.authTime <= account.authValidAfter) throw new ApiError(401, 'unauthenticated');
      const lineage = rawLineage === undefined ? undefined : lineageSchema.parse(rawLineage);
      if (lineage && lineage.version !== account.sessionVersion)
        throw new ApiError(401, 'unauthenticated');
      if (operation !== 'bootstrap') {
        const session = sessionRecordSchema.safeParse(rawSession);
        if (
          !session.success ||
          session.data.version !== account.sessionVersion ||
          session.data.authTime !== actor.authTime ||
          session.data.expiresAt <= time
        ) {
          throw new ApiError(401, 'unauthenticated');
        }
      }
      let hasBirthDate = identity !== undefined;
      if (completed) {
        if (!actor.emailVerified) throw new ApiError(403, 'forbidden');
        if (rawReceipt !== undefined) receiptSchema.parse(rawReceipt);
        if (identity && identity.birthDate !== completed.birthDate)
          throw new ApiError(409, 'conflict');
        if (!identity) {
          if (rawReceipt !== undefined) throw new ApiError(409, 'conflict');
          const declared = assessDeclaredAge(completed.birthDate, new Date(time));
          // A declaration alone never proves age or activates an account.
          account.eligibilityStatus = declared === 'ineligible' ? 'ineligible' : 'review_required';
          tx.set(identityPath, { birthDate: completed.birthDate, createdAt: time });
          hasBirthDate = true;
        }
        tx.set(receiptPath, { operation: 'complete' });
      }
      if (operation === 'revoke') {
        if (Math.floor(time / 1000) - actor.authTime > 300)
          throw new ApiError(401, 'unauthenticated');
        account.sessionVersion++;
        account.authValidAfter = Math.floor(time / 1000);
      }
      account.emailVerificationStatus = actor.emailVerified ? 'verified' : 'pending';
      account.updatedAt = time;
      tx.set(accountPath, account);
      if (newToken) {
        tx.set(sessionPath, {
          version: account.sessionVersion,
          authTime: actor.authTime,
          expiresAt: time + 3_600_000,
        });
        tx.set(lineagePath, { version: account.sessionVersion });
      }
      const result: ServiceResult = { session: toSession(account, actor, hasBirthDate) };
      if (newToken) result.sessionToken = newToken;
      return result;
    });
  };
}
