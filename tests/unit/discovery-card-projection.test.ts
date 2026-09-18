import { describe, expect, it } from 'vitest';
import { projectDiscoveryCard } from '../../functions/src/domain/discovery-card-projection.js';
import type {
  DiscoveryCardPresentation,
  PublicProfileDTO,
} from '../../packages/contracts/src/index.js';

function publicProfile(): PublicProfileDTO {
  return {
    profileRef: 'prf_' + 'p'.repeat(32),
    displayName: 'Sol',
    age: 26,
    city: 'Cidade de Teste',
    photos: [
      { photoRef: 'med_' + 'c'.repeat(32), order: 2 },
      { photoRef: 'med_' + 'a'.repeat(32), order: 0 },
      { photoRef: 'med_' + 'b'.repeat(32), order: 1 },
      { photoRef: 'med_' + 'd'.repeat(32), order: 3 },
    ],
    bio: 'Arquibancada, música e boas conversas.',
    verificationBadge: 'verified',
    fanIdentity: {
      club: { name: 'Clube Horizonte', shortName: 'Horizonte' },
      intensity: 'part_of_routine',
      idols: ['Alex da Serra', 'Bia do Vale', 'Caio do Norte'],
      stadium: {
        attendanceFrequency: 'sometimes',
        preferredSector: 'Setor sintético',
        travelsForMatches: true,
      },
    },
    lifestyle: {
      musicPreferences: ['Ritmo A', 'Ritmo B', 'Ritmo C'],
      hobbies: ['Atividade A', 'Atividade B', 'Atividade C', 'Atividade D'],
      lifestyleStyle: 'balanced',
      pets: 'likes_pets',
    },
    connectionIntents: ['friendship', 'events_companion'],
  };
}

function presentation(
  overrides: Partial<DiscoveryCardPresentation> = {},
): DiscoveryCardPresentation {
  return {
    photoLimit: 2,
    idolLimit: 1,
    showBio: true,
    showLifestyle: true,
    showConnectionIntents: true,
    ...overrides,
  };
}

describe('projeção do DiscoveryCard', () => {
  it('projeta somente a allowlist reduzida a partir de PublicProfileDTO', () => {
    const result = projectDiscoveryCard(publicProfile(), presentation());
    expect(result).toEqual({
      profileRef: 'prf_' + 'p'.repeat(32),
      displayName: 'Sol',
      age: 26,
      city: 'Cidade de Teste',
      photos: [
        { photoRef: 'med_' + 'a'.repeat(32), order: 0 },
        { photoRef: 'med_' + 'b'.repeat(32), order: 1 },
      ],
      bio: 'Arquibancada, música e boas conversas.',
      verificationBadge: 'verified',
      fanIdentity: {
        club: { name: 'Clube Horizonte', shortName: 'Horizonte' },
        intensity: 'part_of_routine',
        idols: ['Alex da Serra'],
      },
      lifestyle: {
        musicPreferences: ['Ritmo A', 'Ritmo B'],
        hobbies: ['Atividade A', 'Atividade B', 'Atividade C'],
        lifestyleStyle: 'balanced',
        pets: 'likes_pets',
      },
      connectionIntents: ['friendship', 'events_companion'],
    });
    expect(JSON.stringify(result)).not.toContain('stadium');
    expect(JSON.stringify(result)).not.toContain('preferredSector');
  });

  it('aplica regras que somente removem informações opcionais', () => {
    const result = projectDiscoveryCard(
      publicProfile(),
      presentation({
        showBio: false,
        showLifestyle: false,
        showConnectionIntents: false,
        idolLimit: 0,
      }),
    );
    expect(result).not.toHaveProperty('bio');
    expect(result).not.toHaveProperty('lifestyle');
    expect(result).not.toHaveProperty('connectionIntents');
    expect(result.fanIdentity.idols).toEqual([]);
  });

  it('não inventa selo ou opcionais ausentes no perfil público', () => {
    const source = publicProfile();
    delete source.verificationBadge;
    delete source.bio;
    delete source.lifestyle;
    delete source.connectionIntents;
    const result = projectDiscoveryCard(source, presentation());
    expect(result).not.toHaveProperty('verificationBadge');
    expect(result).not.toHaveProperty('bio');
    expect(result).not.toHaveProperty('lifestyle');
    expect(result).not.toHaveProperty('connectionIntents');
  });

  it('não altera o PublicProfileDTO recebido', () => {
    const source = publicProfile();
    const snapshot = structuredClone(source);
    projectDiscoveryCard(source, presentation());
    expect(source).toEqual(snapshot);
  });

  it('recusa qualquer fonte que não seja um PublicProfileDTO estrito', () => {
    for (const key of ['uid', 'cpf', 'accountRef', 'birthDate', 'trustLevel', 'score', 'rank']) {
      expect(() =>
        projectDiscoveryCard(
          { ...publicProfile(), [key]: 'synthetic-private-value' } as PublicProfileDTO,
          presentation(),
        ),
      ).toThrow();
    }
  });

  it('recusa regra de apresentação com autoridade indevida', () => {
    expect(() =>
      projectDiscoveryCard(publicProfile(), {
        ...presentation(),
        includePrivateFields: true,
      } as DiscoveryCardPresentation),
    ).toThrow();
  });
});
