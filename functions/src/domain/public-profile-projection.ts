import { z } from 'zod';
import {
  fanCatalogSchema,
  fanDomainSchema,
  identityStatusSchema,
  parseFanDomain,
  publicProfileSchema,
  publicProfileSettingsSchema,
  type PublicProfileDTO,
} from '@social/contracts';
import { ageAt } from './account.js';
import { photoReferenceSchema } from './photo-reference.js';

const citySchema = z.strictObject({
  cityId: z.string().regex(/^city_[A-Za-z0-9_-]{24}$/),
  displayName: z.string().trim().min(1).max(100),
  status: z.enum(['active', 'inactive']),
});
const sourceSchema = z.strictObject({
  publicProfileRef: z.string().regex(/^prf_[A-Za-z0-9_-]{32}$/),
  ownerAccountRef: z.string().regex(/^acc_[A-Za-z0-9_-]{32}$/),
  birthDate: z.string(),
  identityVerificationStatus: identityStatusSchema,
  fanDomain: fanDomainSchema,
  settings: publicProfileSettingsSchema,
  catalog: fanCatalogSchema,
  city: citySchema,
  photos: z.array(photoReferenceSchema).max(12),
});
export type PublicProfileProjectionSource = z.infer<typeof sourceSchema>;

export function projectPublicProfile(
  input: PublicProfileProjectionSource,
  today: Date,
): PublicProfileDTO {
  const source = sourceSchema.parse(input);
  const fanDomain = parseFanDomain(source.fanDomain, source.catalog);
  if (source.city.status !== 'active' || source.city.cityId !== source.settings.cityId) {
    throw new Error('invalid_public_city');
  }
  const club = source.catalog.clubs.find(
    (candidate) =>
      candidate.id === fanDomain.fanProfile.primaryClubId && candidate.status === 'active',
  );
  if (!club) throw new Error('invalid_public_club');
  const idolNames = fanDomain.fanProfile.favoriteIdolIds.map((idolId) => {
    const idol = source.catalog.idols.find(
      (candidate) => candidate.idolId === idolId && candidate.status === 'active',
    );
    if (!idol) throw new Error('invalid_public_idol');
    return idol.canonicalName;
  });
  const stadiumSource = fanDomain.fanProfile.stadiumExperience;
  const stadium =
    stadiumSource?.attendsStadium === true
      ? {
          ...(stadiumSource.attendanceFrequency
            ? { attendanceFrequency: stadiumSource.attendanceFrequency }
            : {}),
          ...(stadiumSource.preferredSector
            ? { preferredSector: stadiumSource.preferredSector }
            : {}),
          ...(stadiumSource.travelsForMatches !== undefined
            ? { travelsForMatches: stadiumSource.travelsForMatches }
            : {}),
        }
      : undefined;
  const photos = source.photos
    .filter(
      (photo) =>
        photo.ownerAccountRef === source.ownerAccountRef &&
        photo.status === 'ready' &&
        photo.moderationStatus === 'approved',
    )
    .sort((left, right) => left.ordering - right.ordering)
    .slice(0, 6)
    .map((photo) => ({ photoRef: photo.photoId, order: photo.ordering }));

  const lifestyle = fanDomain.lifestyleProfile
    ? {
        ...(fanDomain.lifestyleProfile.musicPreferences
          ? { musicPreferences: fanDomain.lifestyleProfile.musicPreferences }
          : {}),
        ...(fanDomain.lifestyleProfile.hobbies
          ? { hobbies: fanDomain.lifestyleProfile.hobbies }
          : {}),
        ...(fanDomain.lifestyleProfile.lifestyleStyle
          ? { lifestyleStyle: fanDomain.lifestyleProfile.lifestyleStyle }
          : {}),
        ...(fanDomain.lifestyleProfile.pets ? { pets: fanDomain.lifestyleProfile.pets } : {}),
      }
    : undefined;

  return publicProfileSchema.parse({
    profileRef: source.publicProfileRef,
    displayName: source.settings.displayName,
    age: ageAt(source.birthDate, today),
    city: source.city.displayName,
    photos,
    ...(source.settings.bio ? { bio: source.settings.bio } : {}),
    ...(source.identityVerificationStatus === 'verified' ? { verificationBadge: 'verified' } : {}),
    fanIdentity: {
      club: { name: club.name, shortName: club.shortName },
      intensity: fanDomain.fanProfile.intensity,
      idols: idolNames,
      ...(stadium && Object.keys(stadium).length ? { stadium } : {}),
    },
    ...(source.settings.showLifestyle && lifestyle && Object.keys(lifestyle).length
      ? { lifestyle }
      : {}),
    ...(source.settings.showConnectionIntents
      ? { connectionIntents: fanDomain.connectionIntents }
      : {}),
  });
}
