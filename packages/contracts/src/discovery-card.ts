import { z } from 'zod';
import { clubIdSchema } from './fan-catalog.js';
import { connectionIntentSchema, fanIntensitySchema } from './fan-domain.js';
import {
  cityIdSchema,
  displayNameSchema,
  publicBioSchema,
  publicCatalogNameSchema,
  publicPhotoSchema,
  publicProfileReferenceSchema,
} from './public-profile.js';

export const discoveryAgeRangeSchema = z
  .strictObject({
    minimum: z.number().int().min(18).max(120),
    maximum: z.number().int().min(18).max(120),
  })
  .refine((range) => range.minimum <= range.maximum, 'invalid_age_range');

export const discoveryFiltersSchema = z
  .strictObject({
    ageRange: discoveryAgeRangeSchema.optional(),
    cityIds: z.array(cityIdSchema).max(10).optional(),
    clubIds: z.array(clubIdSchema).max(10).optional(),
    connectionIntents: z.array(connectionIntentSchema).max(5).optional(),
    verification: z.enum(['any', 'verified_only']).optional(),
  })
  .superRefine((filters, context) => {
    for (const key of ['cityIds', 'clubIds', 'connectionIntents'] as const) {
      const values = filters[key];
      if (values && new Set(values).size !== values.length) {
        context.addIssue({ code: 'custom', path: [key], message: 'duplicate_filter_value' });
      }
    }
  });
export type DiscoveryFilters = z.infer<typeof discoveryFiltersSchema>;

/** Configuração do servidor que pode somente reduzir a allowlist do card. */
export const discoveryCardPresentationSchema = z.strictObject({
  photoLimit: z.number().int().min(1).max(3),
  idolLimit: z.number().int().min(0).max(2),
  showBio: z.boolean(),
  showLifestyle: z.boolean(),
  showConnectionIntents: z.boolean(),
});
export type DiscoveryCardPresentation = z.infer<typeof discoveryCardPresentationSchema>;

export const discoveryCardLifestyleSchema = z.strictObject({
  musicPreferences: z.array(z.string().trim().min(1).max(40)).max(2).optional(),
  hobbies: z.array(z.string().trim().min(1).max(40)).max(3).optional(),
  lifestyleStyle: z.enum(['homebody', 'balanced', 'outgoing']).optional(),
  pets: z.enum(['has_pets', 'likes_pets', 'no_preference']).optional(),
});

export const discoveryCardFanIdentitySchema = z.strictObject({
  club: z.strictObject({
    name: publicCatalogNameSchema,
    shortName: publicCatalogNameSchema.pipe(z.string().max(32)),
  }),
  intensity: fanIntensitySchema,
  idols: z.array(publicCatalogNameSchema).max(2),
});

/** Allowlist menor que PublicProfileDTO para exposição gradual na descoberta. */
export const discoveryCardSchema = z.strictObject({
  profileRef: publicProfileReferenceSchema,
  displayName: displayNameSchema,
  age: z.number().int().min(18).max(120),
  city: z.string().trim().min(1).max(100),
  photos: z.array(publicPhotoSchema).max(3),
  bio: publicBioSchema.optional(),
  verificationBadge: z.literal('verified').optional(),
  fanIdentity: discoveryCardFanIdentitySchema,
  lifestyle: discoveryCardLifestyleSchema.optional(),
  connectionIntents: z.array(connectionIntentSchema).min(1).max(5).optional(),
});
export type DiscoveryCard = z.infer<typeof discoveryCardSchema>;

export function parseDiscoveryFilters(input: unknown): DiscoveryFilters {
  return discoveryFiltersSchema.parse(input);
}

export function parseDiscoveryCard(input: unknown): DiscoveryCard {
  return discoveryCardSchema.parse(input);
}
