export {
  AFFINITY_SIGNAL_KINDS,
  affinitySignalKindSchema,
  affinitySharedTextSchema,
  affinityContextSchema,
  affinitySignalSchema,
  affinityExplanationSchema,
  affinityEngineInputSchema,
} from './affinity.js';
export type {
  AffinitySignalKind,
  AffinityContext,
  AffinitySignal,
  AffinityExplanation,
  AffinityEngineInput,
} from './affinity.js';
export {
  discoveryAgeRangeSchema,
  discoveryFiltersSchema,
  discoveryCardPresentationSchema,
  discoveryCardLifestyleSchema,
  discoveryCardFanIdentitySchema,
  discoveryCardSchema,
  parseDiscoveryFilters,
  parseDiscoveryCard,
} from './discovery-card.js';
export type {
  DiscoveryFilters,
  DiscoveryCardPresentation,
  DiscoveryCard,
} from './discovery-card.js';
export { trustLevelSchema, participatingTrustLevelSchema } from './trust.js';
export type { TrustLevel, ParticipatingTrustLevel } from './trust.js';
export {
  trustContextSchema,
  interactionLimitSchema,
  audienceRuleSchema,
  discoveryEligibilitySchema,
  interactionPermissionSchema,
} from './discovery.js';
export type {
  TrustContext,
  InteractionLimit,
  AudienceRule,
  DiscoveryEligibility,
  InteractionPermission,
} from './discovery.js';
// Único entrypoint público. Não reexportar entidades privadas ou tipos de persistência.
export {
  publicProfileReferenceSchema,
  publicCatalogNameSchema,
  cityIdSchema,
  displayNameSchema,
  publicBioSchema,
  publicProfileSettingsSchema,
  publicPhotoSchema,
  publicFanIdentitySchema,
  publicLifestyleSchema,
  publicProfileSchema,
  parsePublicProfileDTO,
} from './public-profile.js';
export type { PublicProfileSettings, PublicPhotoDTO, PublicProfileDTO } from './public-profile.js';

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
