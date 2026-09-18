import { describe, expect, it } from 'vitest';
import {
  projectPublicProfile,
  type PublicProfileProjectionSource,
} from '../../functions/src/domain/public-profile-projection.js';
import { localFanCatalog } from '../../functions/src/domain/local-fan-catalog.js';

const owner = 'acc_' + 'a'.repeat(32);
function source(): PublicProfileProjectionSource {
  return {
    publicProfileRef: 'prf_' + 'p'.repeat(32),
    ownerAccountRef: owner,
    birthDate: '2000-01-01',
    identityVerificationStatus: 'not_started' as const,
    fanDomain: {
      fanProfile: {
        fanProfileRef: 'fan_' + 'f'.repeat(32),
        primaryClubId: 'club_aaaaaaaaaaaaaaaaaaaaaaaa',
        intensity: 'part_of_routine' as const,
        favoriteIdolIds: ['idol_cccccccccccccccccccccccc'],
        stadiumExperience: {
          attendsStadium: true,
          attendanceFrequency: 'sometimes' as const,
          preferredSector: 'Setor sintético',
          travelsForMatches: false,
        },
        supporterHistory: {
          sinceWhenSupportsClub: 'Dado privado não projetado',
          memorableMatch: 'Jogo fictício que não deve sair',
        },
        clubPreferences: [
          {
            clubId: 'club_aaaaaaaaaaaaaaaaaaaaaaaa',
            relationshipType: 'supporter' as const,
          },
        ],
      },
      connectionIntents: ['friendship' as const, 'events_companion' as const],
      connectionPreference: {
        scopes: ['same_club' as const],
        specificClubIds: [],
      },
      lifestyleProfile: {
        musicPreferences: ['Ritmo sintético'],
        hobbies: ['Atividade fictícia'],
        lifestyleStyle: 'balanced' as const,
        travelStyle: 'planned' as const,
        pets: 'likes_pets' as const,
        childrenPreference: 'open' as const,
        smoking: 'never' as const,
        alcoholPreference: 'socially' as const,
      },
    },
    settings: {
      displayNameKind: 'nickname' as const,
      displayName: 'Sol',
      cityId: 'city_' + 'c'.repeat(24),
      bio: 'Arquibancada, música e boas conversas.',
      showLifestyle: true,
      showConnectionIntents: true,
    },
    catalog: localFanCatalog,
    city: {
      cityId: 'city_' + 'c'.repeat(24),
      displayName: 'Cidade de Teste',
      status: 'active' as const,
    },
    photos: [
      {
        photoId: 'med_' + 'a'.repeat(32),
        ownerAccountRef: owner,
        status: 'ready' as const,
        ordering: 1,
        moderationStatus: 'approved' as const,
      },
      {
        photoId: 'med_' + 'b'.repeat(32),
        ownerAccountRef: owner,
        status: 'ready' as const,
        ordering: 0,
        moderationStatus: 'approved' as const,
      },
      {
        photoId: 'med_' + 'c'.repeat(32),
        ownerAccountRef: owner,
        status: 'pending' as const,
        ordering: 2,
        moderationStatus: 'pending' as const,
      },
      {
        photoId: 'med_' + 'd'.repeat(32),
        ownerAccountRef: 'acc_' + 'z'.repeat(32),
        status: 'ready' as const,
        ordering: 2,
        moderationStatus: 'approved' as const,
      },
    ],
  };
}

describe('fronteira de projeção pública', () => {
  it('calcula idade e resolve nomes canônicos sem IDs editoriais', () => {
    const result = projectPublicProfile(source(), new Date('2026-09-18T00:00:00Z'));
    expect(result).toMatchObject({
      displayName: 'Sol',
      age: 26,
      city: 'Cidade de Teste',
      photos: [
        { photoRef: 'med_' + 'b'.repeat(32), order: 0 },
        { photoRef: 'med_' + 'a'.repeat(32), order: 1 },
      ],
      fanIdentity: {
        club: { name: 'Clube Horizonte', shortName: 'Horizonte' },
        idols: ['Alex da Serra'],
      },
    });
    expect(result).not.toHaveProperty('verificationBadge');
    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain('club_');
    expect(serialized).not.toContain('idol_');
    expect(serialized).not.toContain('accountRef');
    expect(serialized).not.toContain('birthDate');
    expect(serialized).not.toContain('supporterHistory');
    expect(serialized).not.toContain('travelStyle');
    expect(serialized).not.toContain('childrenPreference');
    expect(serialized).not.toContain('smoking');
    expect(serialized).not.toContain('alcoholPreference');
  });

  it('deriva selo somente do estado interno verificado', () => {
    const basic = source();
    expect(projectPublicProfile(basic, new Date('2026-09-18T00:00:00Z'))).not.toHaveProperty(
      'verificationBadge',
    );
    const verified = { ...source(), identityVerificationStatus: 'verified' as const };
    expect(projectPublicProfile(verified, new Date('2026-09-18T00:00:00Z')).verificationBadge).toBe(
      'verified',
    );
    expect(verified.fanDomain).toEqual(basic.fanDomain);
  });

  it('respeita opt-in e mantém atributos privados fora da projeção', () => {
    const input = source();
    input.settings.showLifestyle = false;
    input.settings.showConnectionIntents = false;
    const result = projectPublicProfile(input, new Date('2026-09-18T00:00:00Z'));
    expect(result).not.toHaveProperty('lifestyle');
    expect(result).not.toHaveProperty('connectionIntents');
  });

  it('recusa cidade inativa ou diferente da escolha canônica', () => {
    const inactive = source();
    inactive.city.status = 'inactive';
    expect(() => projectPublicProfile(inactive, new Date('2026-09-18T00:00:00Z'))).toThrow(
      'invalid_public_city',
    );
    const mismatched = source();
    mismatched.city.cityId = 'city_' + 'x'.repeat(24);
    expect(() => projectPublicProfile(mismatched, new Date('2026-09-18T00:00:00Z'))).toThrow(
      'invalid_public_city',
    );
  });

  it('não publica foto pendente, rejeitada ou de outro proprietário', () => {
    const input = source();
    const firstPhoto = input.photos[0];
    if (!firstPhoto) throw new Error('fixture missing');
    firstPhoto.moderationStatus = 'rejected';
    const result = projectPublicProfile(input, new Date('2026-09-18T00:00:00Z'));
    expect(result.photos).toEqual([{ photoRef: 'med_' + 'b'.repeat(32), order: 0 }]);
    expect(JSON.stringify(result)).not.toContain('moderationStatus');
    expect(JSON.stringify(result)).not.toContain('ownerAccountRef');
  });

  it('falha fechado com dado interno inesperado', () => {
    expect(() =>
      projectPublicProfile(
        {
          ...source(),
          internalAdministrativeData: true,
        } as unknown as PublicProfileProjectionSource,
        new Date('2026-09-18T00:00:00Z'),
      ),
    ).toThrow();
  });
});
