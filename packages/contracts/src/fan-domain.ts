import { z } from 'zod';
import { clubIdSchema, fanCatalogSchema, idolIdSchema, type FanCatalog } from './fan-catalog.js';

export const fanProfileRefSchema = z.string().regex(/^fan_[A-Za-z0-9_-]{32}$/);
export const fanIntensitySchema = z.enum([
  'when_possible',
  'frequent_follower',
  'part_of_routine',
  'central_to_life',
]);
export const attendanceFrequencySchema = z.enum([
  'rarely',
  'sometimes',
  'often',
  'almost_every_match',
]);
export const clubRelationshipTypeSchema = z.enum([
  'supporter',
  'sympathizer',
  'open_to_connection',
]);
export const connectionScopeSchema = z.enum([
  'same_club',
  'other_clubs',
  'self_declared_rivals',
  'specific_clubs',
]);
export const connectionIntentSchema = z.enum([
  'relationship',
  'dating',
  'friendship',
  'matchday_companion',
  'events_companion',
]);

const unique = <T>(values: T[]): boolean => new Set(values).size === values.length;

export const stadiumExperienceSchema = z.strictObject({
  attendsStadium: z.boolean(),
  attendanceFrequency: attendanceFrequencySchema.optional(),
  preferredSector: z.string().trim().min(1).max(60).optional(),
  travelsForMatches: z.boolean().optional(),
});
export const supporterHistorySchema = z.strictObject({
  sinceWhenSupportsClub: z.string().trim().min(1).max(80).optional(),
  memorableMatch: z.string().trim().min(1).max(500).optional(),
});
export const fanClubPreferenceSchema = z.strictObject({
  clubId: clubIdSchema,
  relationshipType: clubRelationshipTypeSchema,
});
export type FanClubPreference = z.infer<typeof fanClubPreferenceSchema>;

export const fanProfileSchema = z
  .strictObject({
    fanProfileRef: fanProfileRefSchema,
    primaryClubId: clubIdSchema,
    intensity: fanIntensitySchema,
    favoriteIdolIds: z.array(idolIdSchema).max(5),
    stadiumExperience: stadiumExperienceSchema.optional(),
    supporterHistory: supporterHistorySchema.optional(),
    clubPreferences: z.array(fanClubPreferenceSchema).max(30),
  })
  .superRefine((profile, context) => {
    if (!unique(profile.favoriteIdolIds)) {
      context.addIssue({
        code: 'custom',
        path: ['favoriteIdolIds'],
        message: 'duplicate_idol',
      });
    }
    const preferenceKeys = profile.clubPreferences.map(
      ({ clubId, relationshipType }) => clubId + ':' + relationshipType,
    );
    if (!unique(preferenceKeys)) {
      context.addIssue({
        code: 'custom',
        path: ['clubPreferences'],
        message: 'duplicate_club_preference',
      });
    }
    if (
      profile.stadiumExperience?.attendsStadium === false &&
      (profile.stadiumExperience.attendanceFrequency !== undefined ||
        profile.stadiumExperience.preferredSector !== undefined ||
        profile.stadiumExperience.travelsForMatches === true)
    ) {
      context.addIssue({
        code: 'custom',
        path: ['stadiumExperience'],
        message: 'stadium_details_without_attendance',
      });
    }
  });
export type FanProfile = z.infer<typeof fanProfileSchema>;

export const connectionPreferenceSchema = z
  .strictObject({
    scopes: z.array(connectionScopeSchema).min(1).max(4),
    specificClubIds: z.array(clubIdSchema).max(20),
  })
  .superRefine((preference, context) => {
    if (!unique(preference.scopes) || !unique(preference.specificClubIds)) {
      context.addIssue({ code: 'custom', message: 'duplicate_connection_preference' });
    }
    if (preference.scopes.includes('specific_clubs') !== preference.specificClubIds.length > 0) {
      context.addIssue({
        code: 'custom',
        path: ['specificClubIds'],
        message: 'specific_clubs_scope_mismatch',
      });
    }
  });
export type ConnectionPreference = z.infer<typeof connectionPreferenceSchema>;

export const lifestyleProfileSchema = z.strictObject({
  musicPreferences: z.array(z.string().trim().min(1).max(40)).max(3).optional(),
  hobbies: z.array(z.string().trim().min(1).max(40)).max(5).optional(),
  lifestyleStyle: z.enum(['homebody', 'balanced', 'outgoing']).optional(),
  travelStyle: z.enum(['rarely', 'planned', 'spontaneous', 'frequent']).optional(),
  pets: z.enum(['has_pets', 'likes_pets', 'no_preference']).optional(),
  childrenPreference: z
    .enum(['has_children', 'wants_children', 'does_not_want_children', 'open'])
    .optional(),
  smoking: z.enum(['never', 'occasionally', 'regularly']).optional(),
  alcoholPreference: z.enum(['never', 'socially', 'regularly']).optional(),
});
export type LifestyleProfile = z.infer<typeof lifestyleProfileSchema>;

export const fanDomainSchema = z.strictObject({
  fanProfile: fanProfileSchema,
  connectionIntents: z.array(connectionIntentSchema).min(1).max(5).refine(unique),
  connectionPreference: connectionPreferenceSchema,
  lifestyleProfile: lifestyleProfileSchema.optional(),
});
export type FanDomain = z.infer<typeof fanDomainSchema>;

export function parseFanDomain(input: unknown, rawCatalog: FanCatalog): FanDomain {
  const catalog = fanCatalogSchema.parse(rawCatalog);
  const domain = fanDomainSchema.parse(input);
  const selectableClubs = new Set(
    catalog.clubs.filter(({ status }) => status === 'active').map(({ id }) => id),
  );
  const selectableIdols = new Map(
    catalog.idols.filter(({ status }) => status === 'active').map((idol) => [idol.idolId, idol]),
  );
  const referencedClubs = [
    domain.fanProfile.primaryClubId,
    ...domain.fanProfile.clubPreferences.map(({ clubId }) => clubId),
    ...domain.connectionPreference.specificClubIds,
  ];
  if (referencedClubs.some((clubId) => !selectableClubs.has(clubId))) {
    throw new Error('invalid_club_reference');
  }
  for (const idolId of domain.fanProfile.favoriteIdolIds) {
    const idol = selectableIdols.get(idolId);
    if (!idol || !idol.relatedClubIds.includes(domain.fanProfile.primaryClubId)) {
      throw new Error('invalid_idol_reference');
    }
  }
  return domain;
}
