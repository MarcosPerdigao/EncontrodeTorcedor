import { z } from 'zod';
import { discoveryEligibilitySchema } from './discovery.js';
import { connectionIntentSchema, fanIntensitySchema } from './fan-domain.js';
import { publicCatalogNameSchema, publicProfileSchema } from './public-profile.js';

export const AFFINITY_SIGNAL_KINDS = [
  'same_club',
  'same_idol',
  'same_fan_intensity',
  'shared_stadium_interest',
  'shared_hobby',
  'shared_music',
  'same_lifestyle_style',
  'same_pets_preference',
  'shared_connection_intent',
] as const;
export const affinitySignalKindSchema = z.enum(AFFINITY_SIGNAL_KINDS);
export type AffinitySignalKind = z.infer<typeof affinitySignalKindSchema>;

const contactOrLinkPattern =
  /(?:https?:\/\/|www\.|(?:^|\s)@[\p{L}\p{N}_.-]+|[\p{L}\p{N}._%+-]+@[\p{L}\p{N}.-]+\.[\p{L}]{2,}|(?:\+?\d[\s().-]*){8,}|instagram|whatsapp|tiktok|facebook)/iu;

export const affinitySharedTextSchema = z
  .string()
  .trim()
  .min(1)
  .max(100)
  .refine((value) => !contactOrLinkPattern.test(value), 'contact_or_link_not_allowed');

export const affinityContextSchema = z.strictObject({
  football: z.strictObject({
    primaryClub: publicCatalogNameSchema,
    idols: z.array(publicCatalogNameSchema).max(5),
    fanIntensity: fanIntensitySchema,
    stadiumInterest: z.boolean(),
  }),
  personality: z.strictObject({
    hobbies: z.array(affinitySharedTextSchema).max(5),
    musicPreferences: z.array(affinitySharedTextSchema).max(3),
    lifestyleStyle: z.enum(['homebody', 'balanced', 'outgoing']).optional(),
    pets: z.enum(['has_pets', 'likes_pets', 'no_preference']).optional(),
  }),
  connectionIntents: z.array(connectionIntentSchema).max(5),
});
export type AffinityContext = z.infer<typeof affinityContextSchema>;

export const affinitySignalSchema = z.strictObject({
  kind: affinitySignalKindSchema,
  sharedValue: affinitySharedTextSchema,
  explanation: z.string().trim().min(1).max(240),
});
export type AffinitySignal = z.infer<typeof affinitySignalSchema>;

export const affinityExplanationSchema = z.discriminatedUnion('hasAffinity', [
  z.strictObject({
    hasAffinity: z.literal(true),
    signals: z.array(affinitySignalSchema).min(1).max(24),
  }),
  z.strictObject({
    hasAffinity: z.literal(false),
    signals: z.array(affinitySignalSchema).length(0),
  }),
]);
export type AffinityExplanation = z.infer<typeof affinityExplanationSchema>;

/** Entrada exclusiva do servidor após audiência. Não é um comando do mobile. */
export const affinityEngineInputSchema = z.strictObject({
  eligibility: discoveryEligibilitySchema,
  left: publicProfileSchema,
  right: publicProfileSchema,
});
export type AffinityEngineInput = z.infer<typeof affinityEngineInputSchema>;
