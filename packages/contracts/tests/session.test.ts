import { expect, expectTypeOf, it } from 'vitest';
import {
  sessionSchema,
  completeAccountSchema,
  emptyCommandSchema,
  type SessionDTO,
} from '../src/index.js';
const keys = [
  'accountRef',
  'accountStatus',
  'eligibilityStatus',
  'emailVerified',
  'identityVerificationStatus',
  'onboardingState',
] as const;
const fixture = {
  accountRef: 'acc_' + 'a'.repeat(32),
  accountStatus: 'pending',
  eligibilityStatus: 'pending',
  emailVerified: false,
  identityVerificationStatus: 'not_started',
  onboardingState: 'email_required',
};
it('SessionDTO possui allowlist exata independente', () => {
  expectTypeOf<keyof SessionDTO>().toEqualTypeOf<(typeof keys)[number]>();
  expect(Object.keys(sessionSchema.parse(fixture)).sort()).toEqual([...keys].sort());
});
it.each([
  'uid',
  'UID',
  'cpf',
  'birthDate',
  'email',
  'phone',
  'internalNotes',
  'moderationDetails',
  'roles',
  'sessionVersion',
  'token',
  'futurePrivateField',
])('SessionDTO recusa %s', (key) => {
  expect(() => sessionSchema.parse({ ...fixture, [key]: 'synthetic-invalid' })).toThrow();
});
it.each([
  'uid',
  'accountStatus',
  'eligibilityStatus',
  'sessionVersion',
  'identityVerificationStatus',
  'cpf',
])('comando não aceita autoridade cliente %s', (key) => {
  expect(() =>
    completeAccountSchema.parse({
      birthDate: '2000-01-01',
      requestKey: 'synthetic-key-0001',
      [key]: 'synthetic-invalid',
    }),
  ).toThrow();
  expect(() => emptyCommandSchema.parse({ [key]: 'synthetic-invalid' })).toThrow();
});
