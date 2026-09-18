import { z } from 'zod';
import {
  accountStatusSchema,
  eligibilityStatusSchema,
  identityStatusSchema,
  sessionSchema,
  type SessionDTO,
} from '@social/contracts';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code:
      'invalid_request' | 'unauthenticated' | 'forbidden' | 'conflict' | 'rate_limited',
  ) {
    super(code);
  }
}
export const accountSchema = z.strictObject({
  accountRef: z.string().regex(/^acc_[A-Za-z0-9_-]{32}$/),
  accountStatus: accountStatusSchema,
  eligibilityStatus: eligibilityStatusSchema,
  emailVerificationStatus: z.enum(['pending', 'verified']),
  identityVerificationStatus: identityStatusSchema,
  sessionVersion: z.number().int().nonnegative(),
  authValidAfter: z.number().int().nonnegative(),
  createdAt: z.number().int().nonnegative(),
  updatedAt: z.number().int().nonnegative(),
});
export type Account = z.infer<typeof accountSchema>;
export interface Principal {
  uid: string;
  authTime: number;
  emailVerified: boolean;
}
export const privateIdentitySchema = z.strictObject({
  birthDate: z.string(),
  createdAt: z.number().int().nonnegative(),
});
export function ageAt(birthDate: string, today: Date): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) throw new ApiError(400, 'invalid_request');
  const date = new Date(birthDate + 'T00:00:00.000Z');
  if (
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== birthDate ||
    date.getUTCFullYear() < 1900 ||
    birthDate > today.toISOString().slice(0, 10)
  ) {
    throw new ApiError(400, 'invalid_request');
  }
  const anniversaryPending =
    today.getUTCMonth() < date.getUTCMonth() ||
    (today.getUTCMonth() === date.getUTCMonth() && today.getUTCDate() < date.getUTCDate());
  return today.getUTCFullYear() - date.getUTCFullYear() - Number(anniversaryPending);
}
export function assessDeclaredAge(birthDate: string, today: Date): 'eligible' | 'ineligible' {
  return ageAt(birthDate, today) >= 18 ? 'eligible' : 'ineligible';
}
export function requireAccessible(account: Account): void {
  if (
    !['pending', 'active'].includes(account.accountStatus) ||
    account.eligibilityStatus === 'ineligible'
  ) {
    throw new ApiError(403, 'forbidden');
  }
}
export function requireBasicProfileCreation(
  account: Account,
  principal: Principal,
  hasBirthDate: boolean,
): void {
  requireAccessible(account);
  if (
    !principal.emailVerified ||
    !hasBirthDate ||
    !['review_required', 'eligible'].includes(account.eligibilityStatus)
  ) {
    throw new ApiError(403, 'forbidden');
  }
}
export function requireEligible(account: Account, principal: Principal): void {
  requireAccessible(account);
  if (
    account.accountStatus !== 'active' ||
    account.eligibilityStatus !== 'eligible' ||
    account.identityVerificationStatus !== 'verified' ||
    !principal.emailVerified
  ) {
    throw new ApiError(403, 'forbidden');
  }
}
export function toSession(
  account: Account,
  principal: Principal,
  hasBirthDate: boolean,
  hasFanProfile = false,
): SessionDTO {
  return sessionSchema.parse({
    accountRef: account.accountRef,
    accountStatus: account.accountStatus,
    eligibilityStatus: account.eligibilityStatus,
    emailVerified: principal.emailVerified,
    identityVerificationStatus: account.identityVerificationStatus,
    trustLevel: account.identityVerificationStatus === 'verified' ? 'verified' : 'basic',
    onboardingState: !principal.emailVerified
      ? 'email_required'
      : !hasBirthDate
        ? 'birth_date_required'
        : account.eligibilityStatus === 'ineligible'
          ? 'access_unavailable'
          : !hasFanProfile
            ? 'fan_profile_required'
            : 'ready',
  });
}
