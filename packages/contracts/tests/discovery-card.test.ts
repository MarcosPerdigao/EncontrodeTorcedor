import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  discoveryCardPresentationSchema,
  parseDiscoveryCard,
  parseDiscoveryFilters,
  type DiscoveryCard,
} from '../src/index.js';

const card = {
  profileRef: 'prf_' + 'a'.repeat(32),
  displayName: 'Sol',
  age: 26,
  city: 'Cidade de Teste',
  photos: [{ photoRef: 'med_' + 'a'.repeat(32), order: 0 }],
  bio: 'Arquibancada, música e boas conversas.',
  verificationBadge: 'verified',
  fanIdentity: {
    club: { name: 'Clube Horizonte', shortName: 'Horizonte' },
    intensity: 'part_of_routine',
    idols: ['Alex da Serra'],
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
  'accountRef',
  'birthDate',
  'email',
  'phone',
  'instagram',
  'whatsapp',
  'address',
  'neighborhood',
  'latitude',
  'longitude',
  'distance',
  'token',
  'trustLevel',
  'accountStatus',
  'eligibilityStatus',
  'moderationStatus',
  'reportStatus',
  'score',
  'rank',
  'recommendationReason',
];

describe('contrato DiscoveryCard', () => {
  it('possui exatamente a allowlist revisada', () => {
    expectTypeOf<keyof DiscoveryCard>().toEqualTypeOf<(typeof allowedKeys)[number]>();
    expect(Object.keys(parseDiscoveryCard(card)).sort()).toEqual([...allowedKeys].sort());
  });

  it.each(forbiddenKeys)('recusa o campo proibido %s', (key) => {
    expect(() => parseDiscoveryCard({ ...card, [key]: 'synthetic-private-value' })).toThrow();
  });

  it('não aceita contexto detalhado de estádio nem estado editorial', () => {
    expect(() =>
      parseDiscoveryCard({
        ...card,
        fanIdentity: {
          ...card.fanIdentity,
          stadium: { preferredSector: 'Setor sintético' },
        },
      }),
    ).toThrow();
    expect(() =>
      parseDiscoveryCard({
        ...card,
        fanIdentity: { ...card.fanIdentity, primaryClubId: 'club_' + 'a'.repeat(24) },
      }),
    ).toThrow();
  });

  it('limita fotos, ídolos e lifestyle do card', () => {
    expect(() =>
      parseDiscoveryCard({
        ...card,
        photos: Array.from({ length: 4 }, (_, index) => ({
          photoRef: 'med_' + String(index).repeat(32),
          order: index,
        })),
      }),
    ).toThrow();
    expect(() =>
      parseDiscoveryCard({
        ...card,
        fanIdentity: { ...card.fanIdentity, idols: ['Um', 'Dois', 'Três'] },
      }),
    ).toThrow();
    expect(() =>
      parseDiscoveryCard({
        ...card,
        lifestyle: { ...card.lifestyle, hobbies: ['Um', 'Dois', 'Três', 'Quatro'] },
      }),
    ).toThrow();
  });
});

describe('contratos de filtro e apresentação', () => {
  const filters = {
    ageRange: { minimum: 21, maximum: 35 },
    cityIds: ['city_' + 'c'.repeat(24)],
    clubIds: ['club_' + 'a'.repeat(24)],
    connectionIntents: ['friendship'],
    verification: 'any',
  };

  it('aceita filtros declarativos sem ordenação ou score', () => {
    expect(parseDiscoveryFilters(filters)).toEqual(filters);
  });

  it.each([
    'latitude',
    'longitude',
    'distance',
    'radius',
    'geohash',
    'sortBy',
    'score',
    'rank',
    'algorithm',
    'trustLevel',
    'uid',
  ])('recusa filtro proibido %s', (key) => {
    expect(() => parseDiscoveryFilters({ ...filters, [key]: 'synthetic-invalid' })).toThrow();
  });

  it('recusa faixa inválida, duplicatas e listas excessivas', () => {
    expect(() =>
      parseDiscoveryFilters({ ...filters, ageRange: { minimum: 40, maximum: 20 } }),
    ).toThrow();
    expect(() =>
      parseDiscoveryFilters({
        ...filters,
        cityIds: ['city_' + 'c'.repeat(24), 'city_' + 'c'.repeat(24)],
      }),
    ).toThrow();
    expect(() =>
      parseDiscoveryFilters({
        ...filters,
        clubIds: Array.from(
          { length: 11 },
          (_, index) => 'club_' + index.toString(36).padStart(24, 'a'),
        ),
      }),
    ).toThrow();
  });

  it('restringe apresentação a redução da allowlist', () => {
    const presentation = {
      photoLimit: 3,
      idolLimit: 2,
      showBio: true,
      showLifestyle: true,
      showConnectionIntents: true,
    };
    expect(discoveryCardPresentationSchema.parse(presentation)).toEqual(presentation);
    expect(() =>
      discoveryCardPresentationSchema.parse({ ...presentation, photoLimit: 4 }),
    ).toThrow();
    expect(() =>
      discoveryCardPresentationSchema.parse({ ...presentation, showAccountStatus: true }),
    ).toThrow();
  });
});
