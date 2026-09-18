import { describe, expect, it } from 'vitest';
import {
  deriveTrustLevel,
  evaluateAudience,
  type AudienceEvaluationSource,
  type DiscoveryParticipantSource,
} from '../../functions/src/domain/discovery-eligibility.js';

function participant(
  overrides: Partial<DiscoveryParticipantSource> = {},
): DiscoveryParticipantSource {
  return {
    accountStatus: 'active',
    eligibilityStatus: 'eligible',
    identityVerificationStatus: 'not_started',
    safetyRestriction: 'none',
    hasPublicProfile: true,
    ...overrides,
  };
}

function source(overrides: Partial<AudienceEvaluationSource> = {}): AudienceEvaluationSource {
  return {
    viewer: participant({ identityVerificationStatus: 'verified' }),
    subject: participant(),
    rule: {
      blockedByViewer: false,
      blockedBySubject: false,
      subjectRequiresVerifiedInteraction: false,
      basicToBasicPolicy: 'pending',
      interactionLimit: { window: 'day', maximum: 5, used: 1 },
    },
    ...overrides,
  };
}

describe('derivação de TrustLevel', () => {
  it('deriva basic e verified sem aceitar autoridade do cliente', () => {
    expect(deriveTrustLevel(participant())).toBe('basic');
    expect(deriveTrustLevel(participant({ identityVerificationStatus: 'verified' }))).toBe(
      'verified',
    );
  });

  it.each([
    ['suspended', 'suspended'],
    ['deletion_pending', 'suspended'],
    ['deleted', 'suspended'],
    ['banned', 'banned'],
  ] as const)('deriva %s como %s', (accountStatus, expected) => {
    expect(deriveTrustLevel(participant({ accountStatus }))).toBe(expected);
  });

  it('deriva restricted de inelegibilidade ou restrição de segurança', () => {
    expect(deriveTrustLevel(participant({ eligibilityStatus: 'ineligible' }))).toBe('restricted');
    expect(deriveTrustLevel(participant({ safetyRestriction: 'restricted' }))).toBe('restricted');
  });

  it('falha fechado se a fonte tenta incluir dado privado', () => {
    expect(() =>
      deriveTrustLevel({ ...participant(), birthDate: '2000-01-01' } as DiscoveryParticipantSource),
    ).toThrow();
  });
});

describe('fronteira de audiência', () => {
  it.each([
    ['verified para basic', participant({ identityVerificationStatus: 'verified' }), participant()],
    ['basic para verified', participant(), participant({ identityVerificationStatus: 'verified' })],
    [
      'verified para verified',
      participant({ identityVerificationStatus: 'verified' }),
      participant({ identityVerificationStatus: 'verified' }),
    ],
  ])('permite visualização %s', (_label, viewer, subject) => {
    const decision = evaluateAudience(source({ viewer, subject }));
    expect(decision.eligibility).toEqual({ canView: true, reason: 'eligible' });
    expect(decision.interaction).toMatchObject({ canInitiate: true, reason: 'allowed' });
  });

  it('mantém basic para basic pendente e sem rótulo negativo', () => {
    expect(deriveTrustLevel(participant())).toBe('basic');
    const decision = evaluateAudience(source({ viewer: participant(), subject: participant() }));
    expect(decision).toEqual({
      eligibility: { canView: false, reason: 'policy_pending' },
      interaction: {
        canInitiate: false,
        requiresVerification: false,
        remainingInWindow: 4,
        reason: 'policy_pending',
      },
    });
    expect(JSON.stringify(decision)).not.toMatch(/suspect|untrusted|unsafe/i);
  });

  it.each(['blockedByViewer', 'blockedBySubject'] as const)(
    'bloqueio %s impede exposição e interação inclusive para verified',
    (field) => {
      const input = source();
      input.rule[field] = true;
      expect(evaluateAudience(input)).toEqual({
        eligibility: { canView: false, reason: 'blocked' },
        interaction: {
          canInitiate: false,
          requiresVerification: false,
          remainingInWindow: 4,
          reason: 'blocked',
        },
      });
    },
  );

  it.each(['suspended', 'banned'] as const)(
    'conta %s não participa como visualizador nem como alvo',
    (accountStatus) => {
      const unavailable = participant({ accountStatus });
      expect(evaluateAudience(source({ viewer: unavailable })).eligibility).toEqual({
        canView: false,
        reason: 'participant_unavailable',
      });
      expect(evaluateAudience(source({ subject: unavailable })).eligibility).toEqual({
        canView: false,
        reason: 'participant_unavailable',
      });
    },
  );

  it('retira conta restrita, inelegível ou sem perfil da audiência', () => {
    for (const subject of [
      participant({ safetyRestriction: 'restricted' }),
      participant({ eligibilityStatus: 'ineligible' }),
      participant({ hasPublicProfile: false }),
    ]) {
      expect(evaluateAudience(source({ subject })).eligibility.reason).toBe(
        'participant_unavailable',
      );
    }
  });

  it('permite visualizar mas exige verificação para iniciar quando o alvo escolheu isso', () => {
    const input = source({ viewer: participant() });
    input.subject = participant({ identityVerificationStatus: 'verified' });
    input.rule.subjectRequiresVerifiedInteraction = true;
    expect(evaluateAudience(input)).toEqual({
      eligibility: { canView: true, reason: 'eligible' },
      interaction: {
        canInitiate: false,
        requiresVerification: true,
        remainingInWindow: 4,
        reason: 'verification_required',
      },
    });
  });

  it('não concede acesso ilimitado a verified e aplica cota do servidor', () => {
    const input = source();
    input.rule.interactionLimit = { window: 'day', maximum: 2, used: 2 };
    expect(evaluateAudience(input)).toEqual({
      eligibility: { canView: true, reason: 'eligible' },
      interaction: {
        canInitiate: false,
        requiresVerification: false,
        remainingInWindow: 0,
        reason: 'rate_limited',
      },
    });
  });

  it('expõe apenas resultado mínimo, sem dados privados ou estado administrativo', () => {
    const serialized = JSON.stringify(evaluateAudience(source()));
    for (const forbidden of [
      'uid',
      'accountRef',
      'birthDate',
      'email',
      'phone',
      'cpf',
      'accountStatus',
      'eligibilityStatus',
      'identityVerificationStatus',
      'safetyRestriction',
    ]) {
      expect(serialized).not.toContain(forbidden);
    }
  });
});
