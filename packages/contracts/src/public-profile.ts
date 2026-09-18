import { z } from 'zod';
import {
  attendanceFrequencySchema,
  connectionIntentSchema,
  fanIntensitySchema,
} from './fan-domain.js';

const profileReferenceSchema = z.string().regex(/^prf_[A-Za-z0-9_-]{32}$/);
const publicPhotoReferenceSchema = z.string().regex(/^med_[A-Za-z0-9_-]{32}$/);
export const cityIdSchema = z.string().regex(/^city_[A-Za-z0-9_-]{24}$/);

const contactOrLinkPattern =
  /(?:https?:\/\/|www\.|(?:^|\s)@[\p{L}\p{N}_.-]+|[\p{L}\p{N}._%+-]+@[\p{L}\p{N}.-]+\.[\p{L}]{2,}|(?:\+?\d[\s().-]*){8,}|instagram|whatsapp|tiktok|facebook)/iu;

export const displayNameSchema = z
  .string()
  .trim()
  .min(1)
  .max(32)
  .regex(/^[\p{L}\p{M}\p{N}_'-]+$/u, 'single_public_name')
  .refine((value) => !contactOrLinkPattern.test(value), 'contact_or_link_not_allowed');

export const publicBioSchema = z
  .string()
  .trim()
  .min(1)
  .max(160)
  .refine((value) => !contactOrLinkPattern.test(value), 'contact_or_link_not_allowed');

export const publicProfileSettingsSchema = z.strictObject({
  displayNameKind: z.enum(['first_name', 'nickname']),
  displayName: displayNameSchema,
  cityId: cityIdSchema,
  bio: publicBioSchema.optional(),
  showLifestyle: z.boolean(),
  showConnectionIntents: z.boolean(),
});
export type PublicProfileSettings = z.infer<typeof publicProfileSettingsSchema>;

const publicCatalogNameSchema = z
  .string()
  .trim()
  .min(1)
  .max(100)
  .refine((value) => !/^(?:club|idol)_[A-Za-z0-9_-]+$/i.test(value), 'internal_id_not_allowed');

export const publicPhotoSchema = z.strictObject({
  photoRef: publicPhotoReferenceSchema,
  order: z.number().int().min(0).max(5),
});
export type PublicPhotoDTO = z.infer<typeof publicPhotoSchema>;

export const publicFanIdentitySchema = z.strictObject({
  club: z.strictObject({
    name: publicCatalogNameSchema,
    shortName: publicCatalogNameSchema.pipe(z.string().max(32)),
  }),
  intensity: fanIntensitySchema,
  idols: z.array(publicCatalogNameSchema).max(5),
  stadium: z
    .strictObject({
      attendanceFrequency: attendanceFrequencySchema.optional(),
      preferredSector: z.string().trim().min(1).max(60).optional(),
      travelsForMatches: z.boolean().optional(),
    })
    .optional(),
});

export const publicLifestyleSchema = z.strictObject({
  musicPreferences: z.array(z.string().trim().min(1).max(40)).max(3).optional(),
  hobbies: z.array(z.string().trim().min(1).max(40)).max(5).optional(),
  lifestyleStyle: z.enum(['homebody', 'balanced', 'outgoing']).optional(),
  pets: z.enum(['has_pets', 'likes_pets', 'no_preference']).optional(),
});

/** Allowlist explícita. Campos extras são rejeitados, nunca silenciosamente publicados. */
export const publicProfileSchema = z.strictObject({
  profileRef: profileReferenceSchema,
  displayName: displayNameSchema,
  age: z.number().int().min(18).max(120),
  city: z.string().trim().min(1).max(100),
  photos: z.array(publicPhotoSchema).max(6),
  bio: publicBioSchema.optional(),
  verificationBadge: z.literal('verified').optional(),
  fanIdentity: publicFanIdentitySchema,
  lifestyle: publicLifestyleSchema.optional(),
  connectionIntents: z.array(connectionIntentSchema).min(1).max(5).optional(),
});
export type PublicProfileDTO = z.infer<typeof publicProfileSchema>;

export function parsePublicProfileDTO(input: unknown): PublicProfileDTO {
  return publicProfileSchema.parse(input);
}
