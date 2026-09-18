import {
  discoveryCardPresentationSchema,
  discoveryCardSchema,
  publicProfileSchema,
  type DiscoveryCard,
  type DiscoveryCardPresentation,
  type PublicProfileDTO,
} from '@social/contracts';

/**
 * Reduz um PublicProfileDTO já autorizado. Não consulta entidades privadas,
 * não decide audiência e não ordena candidatos.
 */
export function projectDiscoveryCard(
  input: PublicProfileDTO,
  presentation: DiscoveryCardPresentation,
): DiscoveryCard {
  const publicProfile = publicProfileSchema.parse(input);
  const rule = discoveryCardPresentationSchema.parse(presentation);

  const photos = [...publicProfile.photos]
    .sort((left, right) => left.order - right.order)
    .slice(0, rule.photoLimit);
  const idols = publicProfile.fanIdentity.idols.slice(0, rule.idolLimit);

  const lifestyle = publicProfile.lifestyle
    ? {
        ...(publicProfile.lifestyle.musicPreferences
          ? { musicPreferences: publicProfile.lifestyle.musicPreferences.slice(0, 2) }
          : {}),
        ...(publicProfile.lifestyle.hobbies
          ? { hobbies: publicProfile.lifestyle.hobbies.slice(0, 3) }
          : {}),
        ...(publicProfile.lifestyle.lifestyleStyle
          ? { lifestyleStyle: publicProfile.lifestyle.lifestyleStyle }
          : {}),
        ...(publicProfile.lifestyle.pets ? { pets: publicProfile.lifestyle.pets } : {}),
      }
    : undefined;

  return discoveryCardSchema.parse({
    profileRef: publicProfile.profileRef,
    displayName: publicProfile.displayName,
    age: publicProfile.age,
    city: publicProfile.city,
    photos,
    ...(rule.showBio && publicProfile.bio ? { bio: publicProfile.bio } : {}),
    ...(publicProfile.verificationBadge
      ? { verificationBadge: publicProfile.verificationBadge }
      : {}),
    fanIdentity: {
      club: publicProfile.fanIdentity.club,
      intensity: publicProfile.fanIdentity.intensity,
      idols,
    },
    ...(rule.showLifestyle && lifestyle && Object.keys(lifestyle).length ? { lifestyle } : {}),
    ...(rule.showConnectionIntents && publicProfile.connectionIntents
      ? { connectionIntents: publicProfile.connectionIntents }
      : {}),
  });
}
