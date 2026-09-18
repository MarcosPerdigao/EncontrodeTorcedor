import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  accountStatusSchema,
  fanCatalogSchema,
  fanDomainSchema,
  idolStatusSchema,
  parseFanDomain,
  resolveIdolAlias,
  sessionSchema,
  type FanCatalog,
  type FanDomain,
} from '../src/index.js';

const activeClub = 'club_' + 'a'.repeat(24);
const secondClub = 'club_' + 'b'.repeat(24);
const activeIdol = 'idol_' + 'c'.repeat(24);
const unavailableIdol = 'idol_' + 'd'.repeat(24);
const timestamp = '2026-01-02T03:04:05.000Z';

const catalog: FanCatalog = {
  clubs: [
    {
      id: activeClub,
      name: 'Clube Horizonte',
      shortName: 'Horizonte',
      aliases: ['Horizonte FC'],
      country: 'BR',
      region: 'Região de Teste',
      status: 'active',
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: secondClub,
      name: 'União das Estrelas',
      shortName: 'Estrelas',
      aliases: [],
      country: 'BR',
      status: 'active',
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ],
  idols: [
    {
      idolId: activeIdol,
      canonicalName: 'Alex da Serra',
      aliases: ['A10', 'Alex Serra'],
      relatedClubIds: [activeClub],
      status: 'active',
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      idolId: unavailableIdol,
      canonicalName: 'Beto do Vale',
      aliases: ['B7'],
      relatedClubIds: [secondClub],
      status: 'under_review',
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ],
};

const domain: FanDomain = {
  fanProfile: {
    fanProfileRef: 'fan_' + 'e'.repeat(32),
    primaryClubId: activeClub,
    intensity: 'part_of_routine',
    favoriteIdolIds: [activeIdol],
    stadiumExperience: {
      attendsStadium: true,
      attendanceFrequency: 'sometimes',
      preferredSector: 'Setor sintético',
      travelsForMatches: false,
    },
    supporterHistory: { sinceWhenSupportsClub: 'Desde uma lembrança fictícia' },
    clubPreferences: [
      { clubId: activeClub, relationshipType: 'supporter' },
      { clubId: secondClub, relationshipType: 'sympathizer' },
    ],
  },
  connectionIntents: ['friendship', 'events_companion'],
  connectionPreference: {
    scopes: ['same_club', 'specific_clubs'],
    specificClubIds: [secondClub],
  },
  lifestyleProfile: {
    musicPreferences: ['Ritmo sintético'],
    hobbies: ['Atividade fictícia'],
    lifestyleStyle: 'balanced',
  },
};

describe('catálogo canônico sintético', () => {
  it('alias normalizado resolve para a mesma entidade canônica', () => {
    const first = resolveIdolAlias(catalog, ' A10 ');
    const second = resolveIdolAlias(catalog, 'Álex Serra');
    expect(first.status).toBe('resolved');
    expect(second.status).toBe('resolved');
    if (first.status === 'resolved' && second.status === 'resolved') {
      expect(first.idol.idolId).toBe(activeIdol);
      expect(second.idol.idolId).toBe(activeIdol);
    }
  });

  it('ídolo inexistente ou indisponível não cria entidade improvisada', () => {
    expect(resolveIdolAlias(catalog, 'Nome sem entidade')).toEqual({ status: 'not_found' });
    expect(resolveIdolAlias(catalog, 'B7')).toEqual({ status: 'unavailable' });
  });

  it('rejeita status editorial inválido e alias ambíguo', () => {
    expect(() => idolStatusSchema.parse('automatically_banned')).toThrow();
    const collision = {
      ...catalog,
      idols: [
        ...catalog.idols,
        { ...catalog.idols[0], idolId: 'idol_' + 'f'.repeat(24), canonicalName: 'A10' },
      ],
    };
    expect(() => fanCatalogSchema.parse(collision)).toThrow('ambiguous_idol_alias');
  });

  it('rejeita clube inválido relacionado ao ídolo', () => {
    const invalid = {
      ...catalog,
      idols: [{ ...catalog.idols[0], relatedClubIds: ['club_' + 'z'.repeat(24)] }],
    };
    expect(() => fanCatalogSchema.parse(invalid)).toThrow('unknown_club_id');
  });
});

describe('domínio do torcedor e limites de catálogo', () => {
  it('aceita somente referências válidas e mantém opcionais ausentes', () => {
    expect(parseFanDomain(domain, catalog)).toEqual(domain);
    expect(() => parseFanDomain({ ...domain, lifestyleProfile: undefined }, catalog)).not.toThrow();
  });

  it('rejeita clube, ídolo e preferência fora do catálogo ativo', () => {
    expect(() =>
      parseFanDomain(
        {
          ...domain,
          fanProfile: { ...domain.fanProfile, primaryClubId: 'club_' + 'z'.repeat(24) },
        },
        catalog,
      ),
    ).toThrow('invalid_club_reference');
    expect(() =>
      parseFanDomain(
        {
          ...domain,
          fanProfile: { ...domain.fanProfile, favoriteIdolIds: [unavailableIdol] },
        },
        catalog,
      ),
    ).toThrow('invalid_idol_reference');
    expect(() =>
      parseFanDomain(
        {
          ...domain,
          connectionPreference: {
            scopes: ['specific_clubs'],
            specificClubIds: ['club_' + 'z'.repeat(24)],
          },
        },
        catalog,
      ),
    ).toThrow('invalid_club_reference');
  });

  it('não aceita detalhes de estádio quando a pessoa declarou que não frequenta', () => {
    expect(() =>
      fanDomainSchema.parse({
        ...domain,
        fanProfile: {
          ...domain.fanProfile,
          stadiumExperience: { attendsStadium: false, preferredSector: 'Sintético' },
        },
      }),
    ).toThrow('stadium_details_without_attendance');
  });

  it('torcedor não contém identidade civil ou autoridade da conta', () => {
    const forbidden = [
      'uid',
      'cpf',
      'birthDate',
      'email',
      'phone',
      'accountStatus',
      'eligibilityStatus',
      'identityVerificationStatus',
      'roles',
    ];
    for (const key of forbidden) {
      expect(() =>
        fanDomainSchema.parse({
          ...domain,
          fanProfile: { ...domain.fanProfile, [key]: 'synthetic-private-value' },
        }),
      ).toThrow();
    }
  });

  it('conta e sessão não contêm dados de torcedor', () => {
    expect(() => accountStatusSchema.parse('supporter')).toThrow();
    expect(() =>
      sessionSchema.parse({
        accountRef: 'acc_' + 'a'.repeat(32),
        accountStatus: 'pending',
        eligibilityStatus: 'pending',
        emailVerified: true,
        identityVerificationStatus: 'not_started',
        trustLevel: 'basic',
        onboardingState: 'fan_profile_required',
        primaryClubId: activeClub,
      }),
    ).toThrow();
  });

  it('allowlist do agregado não ganha campos privados silenciosamente', () => {
    const keys = [
      'fanProfile',
      'connectionIntents',
      'connectionPreference',
      'lifestyleProfile',
    ] as const;
    expectTypeOf<keyof FanDomain>().toEqualTypeOf<(typeof keys)[number]>();
    expect(Object.keys(fanDomainSchema.parse(domain)).sort()).toEqual([...keys].sort());
    expect(() => fanDomainSchema.parse({ ...domain, futurePrivateField: true })).toThrow();
  });
});
