import { createHash, randomBytes } from 'node:crypto';
import { z } from 'zod';
import {
  completeAccountSchema,
  createFanProfileSchema,
  emptyCommandSchema,
  parseFanDomain,
  type FanCatalog,
  type FanDomain,
  type SessionDTO,
} from '@social/contracts';
import {
  accountSchema,
  privateIdentitySchema,
  ApiError,
  assessDeclaredAge,
  requireAccessible,
  requireBasicProfileCreation,
  toSession,
  type Account,
  type Principal,
} from './domain/account.js';
import type { Store } from './platform/store.js';

export type Operation = 'bootstrap' | 'state' | 'complete' | 'profileCreate' | 'revoke';
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
const receiptSchema = z.strictObject({
  operation: z.enum(['complete', 'profileCreate']),
});
const emptyCatalog: FanCatalog = { clubs: [], idols: [] };
export interface ServiceResult {
  session: SessionDTO;
  sessionToken?: string;
  fanDomain?: FanDomain;
}
export function createAccountService(
  store: Store,
  now: () => number = Date.now,
  catalog: FanCatalog = emptyCatalog,
) {
  return async (
    operation: Operation,
    actor: Principal,
    body: unknown,
    sessionToken?: string,
  ): Promise<ServiceResult> => {
    const command =
      operation === 'complete'
        ? completeAccountSchema.safeParse(body)
        : operation === 'profileCreate'
          ? createFanProfileSchema.safeParse(body)
          : emptyCommandSchema.safeParse(body);
    if (!command.success) throw new ApiError(400, 'invalid_request');
    const completed =
      operation === 'complete' ? completeAccountSchema.parse(command.data) : undefined;
    const profileCommand =
      operation === 'profileCreate' ? createFanProfileSchema.parse(command.data) : undefined;
    const time = now();
    if (actor.authTime > Math.floor(time / 1000) + 30) throw new ApiError(401, 'unauthenticated');
    const key = digest(actor.uid);
    const accountPath = 'accounts/' + key;
    const identityPath = 'identities/' + key;
    const profilePath = 'fanProfiles/' + key;
    const newToken = operation === 'bootstrap' ? randomBytes(32).toString('base64url') : undefined;
    if (operation !== 'bootstrap' && !/^[A-Za-z0-9_-]{43}$/.test(sessionToken ?? '')) {
      throw new ApiError(401, 'unauthenticated');
    }
    const sessionPath = accountPath + '/sessions/' + digest(newToken ?? sessionToken ?? '');
    const lineagePath = accountPath + '/authSessions/' + String(actor.authTime);
    const limitPath = accountPath + '/rateLimits/' + operation;
    const requestKey = completed?.requestKey ?? profileCommand?.requestKey;
    const receiptPath =
      accountPath + '/operations/' + digest(operation + ':' + (requestKey ?? 'unused'));
    await store.transact(async (tx) => {
      const raw = await tx.get(limitPath);
      const window = Math.floor(time / 60_000);
      const limit = raw === undefined ? undefined : limitSchema.parse(raw);
      const count = limit?.window === window ? limit.count : 0;
      const maximum = {
        bootstrap: 6,
        state: 30,
        complete: 5,
        profileCreate: 5,
        revoke: 5,
      }[operation];
      if (count >= maximum) throw new ApiError(429, 'rate_limited');
      tx.set(limitPath, { window, count: count + 1 });
    });
    return store.transact(async (tx) => {
      const [rawAccount, rawIdentity, rawProfile, rawSession, rawLineage, rawReceipt] =
        await Promise.all([
          tx.get(accountPath),
          tx.get(identityPath),
          tx.get(profilePath),
          tx.get(sessionPath),
          tx.get(lineagePath),
          tx.get(receiptPath),
        ]);
      const identity =
        rawIdentity === undefined ? undefined : privateIdentitySchema.parse(rawIdentity);
      let fanDomain = rawProfile === undefined ? undefined : parseFanDomain(rawProfile, catalog);
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
          account.eligibilityStatus = declared === 'ineligible' ? 'ineligible' : 'review_required';
          tx.set(identityPath, { birthDate: completed.birthDate, createdAt: time });
          hasBirthDate = true;
        }
        tx.set(receiptPath, { operation: 'complete' });
      }
      if (profileCommand) {
        requireBasicProfileCreation(account, actor, hasBirthDate);
        if (rawReceipt !== undefined) receiptSchema.parse(rawReceipt);
        if (!fanDomain) {
          if (rawReceipt !== undefined) throw new ApiError(409, 'conflict');
          const { requestKey: ignoredRequestKey, ...draft } = profileCommand;
          void ignoredRequestKey;
          try {
            fanDomain = parseFanDomain(
              {
                ...draft,
                fanProfile: {
                  ...draft.fanProfile,
                  fanProfileRef: 'fan_' + randomBytes(24).toString('base64url'),
                },
              },
              catalog,
            );
          } catch {
            throw new ApiError(400, 'invalid_request');
          }
          tx.set(profilePath, fanDomain);
        } else if (rawReceipt === undefined) {
          throw new ApiError(409, 'conflict');
        }
        tx.set(receiptPath, { operation: 'profileCreate' });
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
      const result: ServiceResult = {
        session: toSession(account, actor, hasBirthDate, fanDomain !== undefined),
      };
      if (newToken) result.sessionToken = newToken;
      if (profileCommand && fanDomain) result.fanDomain = fanDomain;
      return result;
    });
  };
}
