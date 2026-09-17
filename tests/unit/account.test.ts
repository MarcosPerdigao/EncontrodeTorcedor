import { describe, expect, it } from 'vitest';
import {
  ageAt,
  assessDeclaredAge,
  requireAccessible,
  requireEligible,
  toSession,
  type Account,
} from '../../functions/src/domain/account.js';
import { UnconfiguredIdentityProvider } from '../../functions/src/domain/identity-provider.js';
import { assertLocalRuntime, localAttestation } from '../../functions/src/platform/local.js';
import { safeLog } from '../../functions/src/platform/logger.js';

const actor = { uid: 'synthetic-account', authTime: 100, emailVerified: true };
const account: Account = {
  accountRef: 'acc_' + 'a'.repeat(32),
  accountStatus: 'active',
  eligibilityStatus: 'eligible',
  identityVerificationStatus: 'verified',
  emailVerificationStatus: 'verified',
  sessionVersion: 1,
  authValidAfter: 0,
  createdAt: 1,
  updatedAt: 1,
};
describe('idade no servidor', () => {
  it.each([
    ['2008-09-17', '2026-09-17', 18],
    ['2008-09-18', '2026-09-17', 17],
    ['2008-09-16', '2026-09-17', 18],
    ['2008-02-29', '2026-02-28', 17],
    ['2008-02-29', '2026-03-01', 18],
    ['2004-02-29', '2024-02-29', 20],
    ['2008-12-31', '2026-01-01', 17],
  ])('%s em %s tem %i anos', (birth, today, age) => {
    expect(ageAt(birth, new Date(today + 'T00:00:00Z'))).toBe(age);
    expect(assessDeclaredAge(birth, new Date(today))).toBe(age >= 18 ? 'eligible' : 'ineligible');
  });
  it.each([
    '2025-02-29',
    '2008-02-30',
    '2008-13-01',
    '2008-00-01',
    '2030-01-01',
    '1899-01-01',
    '17/09/2008',
    '',
    'invalid',
  ])('recusa data inválida %s', (birth) => {
    expect(() => ageAt(birth, new Date('2026-09-17T00:00:00Z'))).toThrow('invalid_request');
  });
});
describe('estado vigente prevalece', () => {
  it.each(['suspended', 'banned', 'deletion_pending', 'deleted'] as const)(
    'recusa %s',
    (accountStatus) => {
      expect(() => requireAccessible({ ...account, accountStatus })).toThrow('forbidden');
    },
  );
  it('recusa inelegível mesmo com conta ativa', () => {
    expect(() => requireAccessible({ ...account, eligibilityStatus: 'ineligible' })).toThrow(
      'forbidden',
    );
  });
  it.each(['pending', 'review_required', 'ineligible'] as const)(
    'ação protegida recusa elegibilidade %s',
    (eligibilityStatus) => {
      expect(() => requireEligible({ ...account, eligibilityStatus }, actor)).toThrow('forbidden');
    },
  );
  it('ação protegida exige conta ativa, prova e e-mail', () => {
    expect(() => requireEligible({ ...account, accountStatus: 'pending' }, actor)).toThrow();
    expect(() =>
      requireEligible({ ...account, identityVerificationStatus: 'not_started' }, actor),
    ).toThrow();
    expect(() => requireEligible(account, { ...actor, emailVerified: false })).toThrow();
    expect(() => requireEligible(account, actor)).not.toThrow();
  });
  it('projeção não serializa dados extras de persistência', () => {
    const contaminated = {
      ...account,
      uid: 'synthetic',
      birthDate: '2000-01-01',
      internalNotes: 'synthetic',
    };
    expect(Object.keys(toSession(contaminated, actor, true)).sort()).toEqual(
      [
        'accountRef',
        'accountStatus',
        'eligibilityStatus',
        'emailVerified',
        'identityVerificationStatus',
        'onboardingState',
      ].sort(),
    );
  });
});
describe('integrações ainda não autorizadas', () => {
  it('provedor ausente nunca aprova identidade', async () => {
    const provider = new UnconfiguredIdentityProvider();
    await expect(provider.startVerification()).rejects.toThrow('not_configured');
    await expect(provider.verify()).rejects.toThrow('not_configured');
    await expect(provider.getVerificationStatus()).rejects.toThrow('not_configured');
  });
  const local = {
    FUNCTIONS_EMULATOR: 'true',
    GCLOUD_PROJECT: 'demo-social-foundation',
    FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080',
    FIREBASE_AUTH_EMULATOR_HOST: '127.0.0.1:9099',
  };
  it.each(Object.keys(local))('recusa runtime sem %s', (key) => {
    const altered: NodeJS.ProcessEnv = { ...local };
    delete altered[key];
    expect(() => assertLocalRuntime(altered)).toThrow();
    expect(() => localAttestation(altered)).toThrow();
  });
  it('aceita somente configuração local explícita', async () => {
    expect(() => assertLocalRuntime(local)).not.toThrow();
    await expect(localAttestation(local).verify(undefined)).resolves.toBeUndefined();
    expect(() => assertLocalRuntime({ ...local, GCLOUD_PROJECT: 'non-demo' })).toThrow();
  });
});
describe('logs por allowlist', () => {
  const valid = {
    requestId: '123e4567-e89b-42d3-a456-426614174000',
    operation: 'state',
    result: 'ok',
    latencyMs: 12,
  };
  it.each(['password', 'token', 'Authorization', 'cpf', 'birthDate', 'payload', 'email', 'uid'])(
    'não registra %s',
    (key) => {
      const records: unknown[] = [];
      safeLog({ ...valid, [key]: 'synthetic-invalid' }, (event) => records.push(event));
      expect(records).toEqual([]);
    },
  );
  it('registra somente campos permitidos e rejeita texto livre', () => {
    const records: unknown[] = [];
    safeLog(valid, (event) => records.push(event));
    safeLog({ ...valid, operation: 'synthetic-private-payload' }, (event) => records.push(event));
    expect(records).toEqual([valid]);
  });
});
