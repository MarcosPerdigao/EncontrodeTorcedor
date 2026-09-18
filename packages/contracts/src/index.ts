// Único entrypoint público. Não reexportar entidades privadas ou tipos de persistência.
export { parsePublicProfileDTO, publicProfileSchema } from './public-profile.js';
export type { PublicProfileDTO } from './public-profile.js';

export {
  accountStatusSchema,
  eligibilityStatusSchema,
  identityStatusSchema,
  sessionSchema,
  bootstrapResponseSchema,
  sessionResponseSchema,
  emptyCommandSchema,
  completeAccountSchema,
} from './session.js';
export type { SessionDTO } from './session.js';
export {
  clubIdSchema,
  idolIdSchema,
  clubStatusSchema,
  idolStatusSchema,
  clubSchema,
  idolSchema,
  fanCatalogSchema,
  normalizeCatalogAlias,
  resolveIdolAlias,
} from './fan-catalog.js';
export type { Club, Idol, FanCatalog, IdolResolution } from './fan-catalog.js';

export {
  fanProfileRefSchema,
  fanIntensitySchema,
  attendanceFrequencySchema,
  clubRelationshipTypeSchema,
  connectionScopeSchema,
  connectionIntentSchema,
  stadiumExperienceSchema,
  supporterHistorySchema,
  fanClubPreferenceSchema,
  fanProfileSchema,
  connectionPreferenceSchema,
  lifestyleProfileSchema,
  fanDomainSchema,
  parseFanDomain,
} from './fan-domain.js';
export type {
  FanClubPreference,
  FanProfile,
  ConnectionPreference,
  LifestyleProfile,
  FanDomain,
} from './fan-domain.js';

export { createFanProfileSchema, fanProfileResponseSchema } from './onboarding.js';
export type { CreateFanProfileCommand, FanProfileResponse } from './onboarding.js';
