import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  audienceRuleSchema,
  discoveryEligibilitySchema,
  interactionPermissionSchema,
  publicProfileSettingsSchema,
  trustContextSchema,
  trustLevelSchema,
  type TrustLevel,
} from '../src/index.js';

const rule = {
  blockedByViewer: false,
  blockedBySubject: false,
  subjectRequiresVerifiedInteraction: false,
  basicToBasicPolicy: 'pending',
  interactionLimit: { window: 'day', maximum: 10, used: 0 },
} as const;

describe('contratos de confiança e audiência', () => {
  it('define somente os níveis derivados aprovados', () => {
    expect(trustLevelSchema.options).toEqual([
      'basic',
      'verified',
      'restricted',
      'suspended',
      'banned',
    ]);
    expectTypeOf<TrustLevel>().toEqualTypeOf<
      'basic' | 'verified' | 'restricted' | 'suspended' | 'banned'
    >();
  });

  it('recusa dados privados e campos desconhecidos nos contratos', () => {
    for (const key of [
      'uid',
      'accountRef',
      'birthDate',
      'cpf',
      'email',
      'phone',
      'token',
      'latitude',
      'longitude',
      'reportDetails',
    ]) {
      expect(() =>
        trustContextSchema.parse({ viewer: 'basic', subject: 'verified', [key]: 'x' }),
      ).toThrow();
      expect(() => audienceRuleSchema.parse({ ...rule, [key]: 'x' })).toThrow();
    }
  });

  it('não permite que uma escolha editável do cliente defina confiança', () => {
    const settings = {
      displayNameKind: 'nickname',
      displayName: 'Sol',
      cityId: 'city_' + 'c'.repeat(24),
      showLifestyle: false,
      showConnectionIntents: false,
    };
    expect(() =>
      publicProfileSettingsSchema.parse({ ...settings, trustLevel: 'verified' }),
    ).toThrow();
  });

  it('vincula resultados permitidos e negados a estados coerentes', () => {
    expect(() =>
      discoveryEligibilitySchema.parse({ canView: false, reason: 'eligible' }),
    ).toThrow();
    expect(() =>
      interactionPermissionSchema.parse({
        canInitiate: true,
        requiresVerification: false,
        remainingInWindow: 0,
        reason: 'allowed',
      }),
    ).toThrow();
    expect(() =>
      interactionPermissionSchema.parse({
        canInitiate: false,
        requiresVerification: false,
        remainingInWindow: 1,
        reason: 'verification_required',
      }),
    ).toThrow();
  });

  it('exige cota diária finita e coerente', () => {
    expect(() =>
      audienceRuleSchema.parse({
        ...rule,
        interactionLimit: { window: 'day', maximum: 0, used: 0 },
      }),
    ).toThrow();
    expect(() =>
      audienceRuleSchema.parse({
        ...rule,
        interactionLimit: { window: 'forever', maximum: 10, used: 0 },
      }),
    ).toThrow();
  });
});
