import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  parsePublicProfileDTO,
  publicProfileSettingsSchema,
  type PublicProfileDTO,
} from '../src/index.js';
import type { PrivateUserData } from '../src/server/private-user-data.js';

const fixture = {
  profileRef: 'prf_' + 'a'.repeat(32),
  displayName: 'Sol',
  age: 26,
  city: 'Cidade de Teste',
  photos: [{ photoRef: 'med_' + 'b'.repeat(32), order: 0 }],
  bio: 'Gosto de arquibancada e música.',
  verificationBadge: 'verified',
  fanIdentity: {
    club: { name: 'Clube Horizonte', shortName: 'Horizonte' },
    intensity: 'part_of_routine',
    idols: ['Alex da Serra'],
    stadium: {
      attendanceFrequency: 'sometimes',
      preferredSector: 'Setor sintético',
      travelsForMatches: false,
    },
  },
  lifestyle: {
    musicPreferences: ['Ritmo sintético'],
    hobbies: ['Atividade fictícia'],
    lifestyleStyle: 'balanced',
    pets: 'likes_pets',
  },
  connectionIntents: ['friendship'],
};

const allowedKeys = [
  'profileRef',
  'displayName',
  'age',
  'city',
  'photos',
  'bio',
  'verificationBadge',
  'fanIdentity',
  'lifestyle',
  'connectionIntents',
] as const;
const forbiddenKeys = [
  'cpf',
  'uid',
  'UID',
  'userId',
  'ownerUid',
  'accountRef',
  'birthDate',
  'dateOfBirth',
  'email',
  'phone',
  'telefone',
  'document',
  'address',
  'bairro',
  'latitude',
  'longitude',
  'coordinates',
  'geohash',
  'distance',
  'token',
  'tokens',
  'accessToken',
  'refreshToken',
  'trustLevel',
  'accountStatus',
  'eligibilityStatus',
  'identityVerificationStatus',
  'moderationStatus',
  'editorialStatus',
  'roles',
  'admin',
  'storagePath',
  'matchHistory',
  'recentGames',
  'instagram',
  'tiktok',
  'facebook',
  'whatsapp',
];

describe('PublicProfileDTO: allowlist pública', () => {
  it('possui exatamente as chaves superiores revisadas', () => {
    expectTypeOf<keyof PublicProfileDTO>().toEqualTypeOf<(typeof allowedKeys)[number]>();
    expectTypeOf<Extract<keyof PublicProfileDTO, keyof PrivateUserData>>().toEqualTypeOf<never>();
    const parsed = parsePublicProfileDTO(fixture);
    expect(Object.keys(parsed).sort()).toEqual([...allowedKeys].sort());
    expect(parsed).toEqual(fixture);
  });

  it.each(forbiddenKeys)('recusa o campo proibido %s', (key) => {
    expect(() => parsePublicProfileDTO({ ...fixture, [key]: 'synthetic-private-value' })).toThrow();
  });

  it('recusa campos desconhecidos em todos os níveis', () => {
    expect(() => parsePublicProfileDTO({ ...fixture, futureInternalField: true })).toThrow();
    expect(() =>
      parsePublicProfileDTO({
        ...fixture,
        fanIdentity: { ...fixture.fanIdentity, primaryClubId: 'club_' + 'a'.repeat(24) },
      }),
    ).toThrow();
    expect(() =>
      parsePublicProfileDTO({
        ...fixture,
        photos: [
          {
            ...fixture.photos[0],
            ownerAccountRef: 'acc_' + 'a'.repeat(32),
            moderationStatus: 'approved',
          },
        ],
      }),
    ).toThrow();
  });

  it.each(['profileRef', 'displayName', 'age', 'city', 'photos', 'fanIdentity'])(
    'exige o campo estrutural %s',
    (key) => {
      const incomplete: Record<string, unknown> = { ...fixture };
      delete incomplete[key];
      expect(() => parsePublicProfileDTO(incomplete)).toThrow();
    },
  );

  it('limita bio e recusa contato, rede social e link', () => {
    expect(() => parsePublicProfileDTO({ ...fixture, bio: 'x'.repeat(161) })).toThrow();
    for (const bio of [
      'fale comigo em pessoa@example.invalid',
      'me chama no @perfil',
      'https://example.invalid',
      'WhatsApp 31999999999',
      'instagram perfil',
    ]) {
      expect(() => parsePublicProfileDTO({ ...fixture, bio })).toThrow();
    }
  });

  it('aceita primeiro nome ou apelido de um termo e recusa nome composto', () => {
    expect(() => parsePublicProfileDTO({ ...fixture, displayName: 'Sol-10' })).not.toThrow();
    expect(() => parsePublicProfileDTO({ ...fixture, displayName: 'Nome Sobrenome' })).toThrow();
  });

  it('não aceita ID ou status interno no lugar do nome canônico do ídolo', () => {
    expect(() =>
      parsePublicProfileDTO({
        ...fixture,
        fanIdentity: { ...fixture.fanIdentity, idols: ['idol_' + 'c'.repeat(24)] },
      }),
    ).toThrow();
    expect(() =>
      parsePublicProfileDTO({
        ...fixture,
        fanIdentity: {
          ...fixture.fanIdentity,
          idols: [{ idolId: 'idol_' + 'c'.repeat(24), status: 'active' }],
        },
      }),
    ).toThrow();
  });
});

describe('PublicProfileSettings: autoridade limitada do cliente', () => {
  const settings = {
    displayNameKind: 'nickname',
    displayName: 'Sol',
    cityId: 'city_' + 'd'.repeat(24),
    bio: 'Uma bio sintética.',
    showLifestyle: true,
    showConnectionIntents: false,
  };

  it('aceita somente escolhas de exibição', () => {
    expect(publicProfileSettingsSchema.parse(settings)).toEqual(settings);
  });

  it.each([
    'verificationBadge',
    'trustLevel',
    'identityVerificationStatus',
    'age',
    'birthDate',
    'accountStatus',
    'eligibilityStatus',
    'moderationStatus',
    'photoRefs',
    'uid',
    'cpf',
    'instagram',
    'whatsapp',
  ])('cliente não define %s', (key) => {
    expect(() =>
      publicProfileSettingsSchema.parse({ ...settings, [key]: 'synthetic-invalid' }),
    ).toThrow();
  });
});
