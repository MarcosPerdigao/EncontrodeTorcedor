import { describe, expect, expectTypeOf, it } from 'vitest';

import { parsePublicProfileDTO, type PublicProfileDTO } from '../src/index.js';
import type { PrivateUserData } from '../src/server/private-user-data.js';

const fixture = {
  profileRef: `prf_${'a'.repeat(32)}`,
  nickname: 'Pessoa sintética',
  age: 25,
  city: 'Cidade de teste',
  bio: 'Fixture artificial.',
  photoRefs: [`med_${'b'.repeat(32)}`],
  interests: ['futebol'],
  goals: ['friendship'],
};

// Expectativa independente: NÃO derivar esta lista do schema sob teste.
const allowedKeys = [
  'profileRef',
  'nickname',
  'age',
  'city',
  'bio',
  'photoRefs',
  'interests',
  'goals',
] as const;
const forbiddenKeys = [
  'email',
  'phone',
  'telefone',
  'birthDate',
  'dateOfBirth',
  'document',
  'documento',
  'cpf',
  'latitude',
  'longitude',
  'coordinates',
  'geohash',
  'address',
  'bairro',
  'ip',
  'IP',
  'tokens',
  'token',
  'accessToken',
  'refreshToken',
  'uid',
  'UID',
  'userId',
  'ownerUid',
  'verification',
  'verificationData',
  'identityVerification',
  'admin',
  'role',
  'roles',
  'customClaims',
  'moderationStatus',
  'internalNotes',
  'storagePath',
];

describe('PublicProfileDTO: fronteira de privacidade', () => {
  it('possui exatamente a allowlist pública no tipo e no JSON', () => {
    expectTypeOf<keyof PublicProfileDTO>().toEqualTypeOf<(typeof allowedKeys)[number]>();
    expectTypeOf<Extract<keyof PublicProfileDTO, keyof PrivateUserData>>().toEqualTypeOf<never>();
    const result = parsePublicProfileDTO(fixture);
    expect(Object.keys(result).sort()).toEqual([...allowedKeys].sort());
    expect(JSON.parse(JSON.stringify(result))).toEqual(fixture);
  });

  it.each(forbiddenKeys)('recusa o campo privado %s, mesmo em variável com extras', (key) => {
    const contaminated = { ...fixture, [key]: 'synthetic-private-value' };
    expect(() => parsePublicProfileDTO(contaminated)).toThrow();
  });

  it('recusa campos futuros desconhecidos, não apenas uma denylist conhecida', () => {
    expect(() => parsePublicProfileDTO({ ...fixture, futureInternalField: true })).toThrow();
  });

  it('não permite objetos privados escondidos em listas públicas', () => {
    expect(() =>
      parsePublicProfileDTO({ ...fixture, photoRefs: [{ uid: 'synthetic-b' }] }),
    ).toThrow();
    expect(() =>
      parsePublicProfileDTO({ ...fixture, interests: [{ email: 'test@example.invalid' }] }),
    ).toThrow();
  });

  it('não aceita UID como referência e não aceita idade fora do contrato', () => {
    expect(() =>
      parsePublicProfileDTO({ ...fixture, profileRef: 'synthetic-internal-uid' }),
    ).toThrow();
    expect(() => parsePublicProfileDTO({ ...fixture, age: 17 })).toThrow();
    expect(() => parsePublicProfileDTO({ ...fixture, age: 25.5 })).toThrow();
  });

  it('recusa listas e textos fora do limite', () => {
    expect(() => parsePublicProfileDTO({ ...fixture, bio: 'x'.repeat(501) })).toThrow();
    expect(() =>
      parsePublicProfileDTO({ ...fixture, photoRefs: Array(7).fill(fixture.photoRefs[0]) }),
    ).toThrow();
  });
});
