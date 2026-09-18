import { describe, expect, it } from 'vitest';
import type { PublicProfileDTO } from '../../packages/contracts/src/index.js';
import {
  createAffinityContext,
  explainAffinity,
} from '../../functions/src/domain/affinity-engine.js';
import { evaluateAudience } from '../../functions/src/domain/discovery-eligibility.js';

function profile(overrides: Partial<PublicProfileDTO> = {}): PublicProfileDTO {
  return {
    profileRef: 'prf_' + 'a'.repeat(32),
    displayName: 'Sol',
    age: 26,
    city: 'Cidade de Teste',
    photos: [],
    fanIdentity: {
      club: { name: 'Clube Horizonte', shortName: 'Horizonte' },
      intensity: 'part_of_routine',
      idols: ['Alex da Serra'],
      stadium: { attendanceFrequency: 'sometimes' },
    },
    lifestyle: {
      hobbies: ['Atividade fictícia'],
      musicPreferences: ['Ritmo sintético'],
      lifestyleStyle: 'balanced',
      pets: 'likes_pets',
    },
    connectionIntents: ['friendship'],
    ...overrides,
  };
}

const eligible = { canView: true, reason: 'eligible' } as const;

function kinds(left = profile(), right = profile()): string[] {
  const result = explainAffinity({ eligibility: eligible, left, right });
  return result.signals.map((signal) => signal.kind);
}

function audienceFor(options: { blocked?: boolean; subjectStatus?: 'active' | 'suspended' }) {
  return evaluateAudience({
    viewer: {
      accountStatus: 'active',
      eligibilityStatus: 'eligible',
      identityVerificationStatus: 'verified',
      safetyRestriction: 'none',
      hasPublicProfile: true,
    },
    subject: {
      accountStatus: options.subjectStatus ?? 'active',
      eligibilityStatus: 'eligible',
      identityVerificationStatus: 'not_started',
      safetyRestriction: 'none',
      hasPublicProfile: true,
    },
    rule: {
      blockedByViewer: options.blocked ?? false,
      blockedBySubject: false,
      subjectRequiresVerifiedInteraction: false,
      basicToBasicPolicy: 'pending',
      interactionLimit: { window: 'day', maximum: 5, used: 0 },
    },
  }).eligibility;
}

describe('regras positivas de afinidade', () => {
  it('mesmo clube gera sinal explicado', () => {
    const result = explainAffinity({ eligibility: eligible, left: profile(), right: profile() });
    expect(result.signals).toContainEqual({
      kind: 'same_club',
      sharedValue: 'Clube Horizonte',
      explanation: 'Vocês torcem para Clube Horizonte.',
    });
  });

  it('mesmo ídolo gera sinal explicado', () => {
    expect(kinds()).toContain('same_idol');
  });

  it('hobby compartilhado gera sinal com comparação normalizada', () => {
    const right = profile({
      lifestyle: {
        ...profile().lifestyle,
        hobbies: ['  ATIVIDADE FICTÍCIA  '],
      },
    });
    expect(kinds(profile(), right)).toContain('shared_hobby');
  });

  it('música compartilhada gera sinal com comparação normalizada', () => {
    const right = profile({
      lifestyle: {
        ...profile().lifestyle,
        musicPreferences: ['RITMO SINTÉTICO'],
      },
    });
    expect(kinds(profile(), right)).toContain('shared_music');
  });

  it('gera sinais explícitos para intensidade, estádio, lifestyle, pets e intenção', () => {
    expect(kinds()).toEqual([
      'same_club',
      'same_idol',
      'same_fan_intensity',
      'shared_stadium_interest',
      'shared_hobby',
      'shared_music',
      'same_lifestyle_style',
      'same_pets_preference',
      'shared_connection_intent',
    ]);
  });
});

describe('separação de segurança e privacidade', () => {
  it('bloqueio decidido pela audiência impede geração de afinidade', () => {
    const eligibility = audienceFor({ blocked: true });
    expect(eligibility).toEqual({ canView: false, reason: 'blocked' });
    expect(() => explainAffinity({ eligibility, left: profile(), right: profile() })).toThrow(
      'affinity_not_available',
    );
  });

  it('conta suspensa decidida pela audiência não gera afinidade', () => {
    const eligibility = audienceFor({ subjectStatus: 'suspended' });
    expect(eligibility).toEqual({ canView: false, reason: 'participant_unavailable' });
    expect(() => explainAffinity({ eligibility, left: profile(), right: profile() })).toThrow(
      'affinity_not_available',
    );
  });

  it.each(['cpf', 'uid', 'birthDate', 'email', 'phone', 'messages', 'reports'])(
    'dado proibido %s não entra nem influencia',
    (key) => {
      expect(() =>
        explainAffinity({
          eligibility: eligible,
          left: { ...profile(), [key]: 'private-value' } as PublicProfileDTO,
          right: profile(),
        }),
      ).toThrow();
    },
  );

  it('filtra contato disfarçado em texto público antes do contexto', () => {
    const input = profile({
      lifestyle: {
        ...profile().lifestyle,
        hobbies: ['me chama no @perfil'],
        musicPreferences: ['https://example.invalid'],
      },
    });
    const context = createAffinityContext(input);
    expect(context.personality.hobbies).toEqual([]);
    expect(context.personality.musicPreferences).toEqual([]);
  });
});

describe('explicabilidade sem ranking', () => {
  it('todo sinal contém tipo, valor compartilhado e explicação', () => {
    const result = explainAffinity({ eligibility: eligible, left: profile(), right: profile() });
    expect(result.hasAffinity).toBe(true);
    for (const signal of result.signals) {
      expect(signal.kind.length).toBeGreaterThan(0);
      expect(signal.sharedValue.length).toBeGreaterThan(0);
      expect(signal.explanation.length).toBeGreaterThan(0);
    }
  });

  it('não retorna score público nem metadado oculto', () => {
    const result = explainAffinity({ eligibility: eligible, left: profile(), right: profile() });
    const serialized = JSON.stringify(result);
    for (const forbidden of [
      'score',
      'percentage',
      'weight',
      'rank',
      'probability',
      'confidence',
      'model',
      'algorithm',
    ]) {
      expect(serialized).not.toContain(forbidden);
    }
  });

  it('campos públicos fora do contexto não criam regra oculta', () => {
    const left = profile({
      displayName: 'Sol',
      age: 26,
      city: 'Cidade A',
      bio: 'Bio A',
      fanIdentity: {
        club: { name: 'Clube A', shortName: 'A' },
        intensity: 'when_possible',
        idols: [],
      },
      lifestyle: undefined,
      connectionIntents: undefined,
    });
    const right = profile({
      profileRef: 'prf_' + 'b'.repeat(32),
      displayName: 'Lua',
      age: 40,
      city: 'Cidade B',
      bio: 'Bio B',
      fanIdentity: {
        club: { name: 'Clube B', shortName: 'B' },
        intensity: 'central_to_life',
        idols: [],
      },
      lifestyle: undefined,
      connectionIntents: undefined,
    });
    expect(explainAffinity({ eligibility: eligible, left, right })).toEqual({
      hasAffinity: false,
      signals: [],
    });
  });

  it('não muta os perfis recebidos', () => {
    const left = profile();
    const right = profile({ profileRef: 'prf_' + 'b'.repeat(32) });
    const snapshot = structuredClone({ left, right });
    explainAffinity({ eligibility: eligible, left, right });
    expect({ left, right }).toEqual(snapshot);
  });
});
