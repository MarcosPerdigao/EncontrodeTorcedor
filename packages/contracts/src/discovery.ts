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

export const discoveryEligibilitySchema = z.strictObject({
  canView: z.boolean(),
  reason: z.enum(['eligible', 'blocked', 'participant_unavailable', 'policy_pending']),
});
export type DiscoveryEligibility = z.infer<typeof discoveryEligibilitySchema>;

export const interactionPermissionSchema = z.strictObject({
  canInitiate: z.boolean(),
  requiresVerification: z.boolean(),
  remainingInWindow: z.number().int().nonnegative().max(10_000),
  reason: z.enum([
    'allowed',
    'blocked',
    'participant_unavailable',
    'policy_pending',
    'verification_required',
    'rate_limited',
  ]),
});
export type InteractionPermission = z.infer<typeof interactionPermissionSchema>;
