import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  AFFINITY_SIGNAL_KINDS,
  affinityContextSchema,
  affinityEngineInputSchema,
  affinityExplanationSchema,
  affinitySharedTextSchema,
  type AffinityExplanation,
} from '../src/index.js';

const context = {
  football: {
    primaryClub: 'Clube Horizonte',
    idols: ['Alex da Serra'],
    fanIntensity: 'part_of_routine',
    stadiumInterest: true,
  },
  personality: {
    hobbies: ['Atividade fictícia'],
    musicPreferences: ['Ritmo sintético'],
    lifestyleStyle: 'balanced',
    pets: 'likes_pets',
  },
  connectionIntents: ['friendship'],
};

const signal = {
  kind: 'same_club',
  sharedValue: 'Clube Horizonte',
  explanation: 'Vocês torcem para Clube Horizonte.',
};

describe('contratos do motor de afinidade', () => {
  it('expõe uma taxonomia fechada e documentada de regras', () => {
    expect(AFFINITY_SIGNAL_KINDS).toEqual([
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

  it('mantém o contexto mínimo e recusa dados privados ou administrativos', () => {
    expect(affinityContextSchema.parse(context)).toEqual(context);
    for (const key of [
      'cpf',
      'uid',
      'accountRef',
      'birthDate',
      'email',
      'phone',
      'income',
      'gender',
      'religion',
      'politics',
      'health',
      'sexualOrientation',
      'latitude',
      'longitude',
      'messages',
      'reports',
      'accountStatus',
      'trustLevel',
      'photos',
    ]) {
      expect(() => affinityContextSchema.parse({ ...context, [key]: 'private' })).toThrow();
    }
  });

  it('proíbe contato e link em textos compartilhados', () => {
    for (const value of [
      'pessoa@example.invalid',
      'me chama no @perfil',
      'https://example.invalid',
      'WhatsApp 31999999999',
    ]) {
      expect(() => affinitySharedTextSchema.parse(value)).toThrow();
    }
  });

  it('exige motivo para toda afinidade positiva', () => {
    expect(affinityExplanationSchema.parse({ hasAffinity: true, signals: [signal] })).toEqual({
      hasAffinity: true,
      signals: [signal],
    });
    expect(() => affinityExplanationSchema.parse({ hasAffinity: true, signals: [] })).toThrow();
    expect(() =>
      affinityExplanationSchema.parse({ hasAffinity: false, signals: [signal] }),
    ).toThrow();
  });

  it('não possui score, percentual, peso, rank ou probabilidade no resultado', () => {
    expectTypeOf<keyof AffinityExplanation>().toEqualTypeOf<'hasAffinity' | 'signals'>();
    for (const key of ['score', 'percentage', 'weight', 'rank', 'probability', 'confidence']) {
      expect(() =>
        affinityExplanationSchema.parse({ hasAffinity: true, signals: [signal], [key]: 95 }),
      ).toThrow();
    }
  });

  it('mantém a entrada do servidor estrita', () => {
    expect(() =>
      affinityEngineInputSchema.parse({
        eligibility: { canView: false, reason: 'eligible' },
        left: {},
        right: {},
      }),
    ).toThrow();
    expect(() =>
      affinityEngineInputSchema.parse({ eligibility: {}, left: {}, right: {}, uid: 'x' }),
    ).toThrow();
  });
});
