import { z } from 'zod';
import { trustLevelSchema } from './trust.js';

/** Contexto interno derivado. Nunca aceitar este objeto de um cliente. */
export const trustContextSchema = z.strictObject({
  viewer: trustLevelSchema,
  subject: trustLevelSchema,
});
export type TrustContext = z.infer<typeof trustContextSchema>;

export const interactionLimitSchema = z.strictObject({
  window: z.literal('day'),
  maximum: z.number().int().min(1).max(10_000),
  used: z.number().int().nonnegative().max(10_000),
});
export type InteractionLimit = z.infer<typeof interactionLimitSchema>;

/** Regra carregada de fontes do servidor, sem identificadores ou dados de perfil. */
export const audienceRuleSchema = z.strictObject({
  blockedByViewer: z.boolean(),
  blockedBySubject: z.boolean(),
  subjectRequiresVerifiedInteraction: z.boolean(),
  basicToBasicPolicy: z.literal('pending'),
  interactionLimit: interactionLimitSchema,
});
export type AudienceRule = z.infer<typeof audienceRuleSchema>;

export const discoveryEligibilitySchema = z.discriminatedUnion('reason', [
  z.strictObject({ canView: z.literal(true), reason: z.literal('eligible') }),
  z.strictObject({ canView: z.literal(false), reason: z.literal('blocked') }),
  z.strictObject({ canView: z.literal(false), reason: z.literal('participant_unavailable') }),
  z.strictObject({ canView: z.literal(false), reason: z.literal('policy_pending') }),
]);
export type DiscoveryEligibility = z.infer<typeof discoveryEligibilitySchema>;

const remainingInWindowSchema = z.number().int().nonnegative().max(10_000);
export const interactionPermissionSchema = z.discriminatedUnion('reason', [
  z.strictObject({
    canInitiate: z.literal(true),
    requiresVerification: z.literal(false),
    remainingInWindow: remainingInWindowSchema.min(1),
    reason: z.literal('allowed'),
  }),
  z.strictObject({
    canInitiate: z.literal(false),
    requiresVerification: z.literal(true),
    remainingInWindow: remainingInWindowSchema,
    reason: z.literal('verification_required'),
  }),
  ...(['blocked', 'participant_unavailable', 'policy_pending', 'rate_limited'] as const).map(
    (reason) =>
      z.strictObject({
        canInitiate: z.literal(false),
        requiresVerification: z.literal(false),
        remainingInWindow: remainingInWindowSchema,
        reason: z.literal(reason),
      }),
  ),
]);
export type InteractionPermission = z.infer<typeof interactionPermissionSchema>;
