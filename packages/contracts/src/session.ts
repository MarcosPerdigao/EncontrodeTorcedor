import { z } from 'zod';

export const accountStatusSchema = z.enum([
  'pending',
  'active',
  'suspended',
  'banned',
  'deletion_pending',
  'deleted',
]);
export const eligibilityStatusSchema = z.enum([
  'pending',
  'eligible',
  'ineligible',
  'review_required',
]);
export const identityStatusSchema = z.enum([
  'not_started',
  'pending',
  'verified',
  'rejected',
  'manual_review',
]);
export const sessionSchema = z.strictObject({
  accountRef: z.string().regex(/^acc_[A-Za-z0-9_-]{32}$/),
  accountStatus: accountStatusSchema,
  eligibilityStatus: eligibilityStatusSchema,
  emailVerified: z.boolean(),
  identityVerificationStatus: identityStatusSchema,
  onboardingState: z.enum([
    'email_required',
    'birth_date_required',
    'verification_required',
    'ready',
  ]),
});
export type SessionDTO = z.infer<typeof sessionSchema>;
export const bootstrapResponseSchema = z.strictObject({
  session: sessionSchema,
  sessionToken: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
});
export const sessionResponseSchema = z.strictObject({ session: sessionSchema });
export const emptyCommandSchema = z.strictObject({});
export const completeAccountSchema = z.strictObject({
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  requestKey: z.string().regex(/^[A-Za-z0-9_-]{16,80}$/),
});
