import { describe, expect, it } from 'vitest';
import {
  createFanProfileSchema,
  fanProfileResponseSchema,
  type CreateFanProfileCommand,
} from '../src/index.js';

const command: CreateFanProfileCommand = {
  fanProfile: {
    primaryClubId: 'club_' + 'a'.repeat(24),
    intensity: 'when_possible',
    favoriteIdolIds: [],
    clubPreferences: [
      {
        clubId: 'club_' + 'a'.repeat(24),
        relationshipType: 'supporter',
      },
    ],
  },
  connectionIntents: ['friendship'],
  connectionPreference: { scopes: ['same_club'], specificClubIds: [] },
  requestKey: 'synthetic-profile-0001',
};

describe('contrato de criação do perfil', () => {
  it('mantém dados opcionais opcionais e não exige documento', () => {
    expect(createFanProfileSchema.parse(command)).toEqual(command);
    expect(JSON.stringify(command).toLowerCase()).not.toContain('cpf');
  });

  it.each([
    'uid',
    'userId',
    'cpf',
    'birthDate',
    'email',
    'phone',
    'identityVerificationStatus',
    'trustLevel',
    'accountStatus',
    'eligibilityStatus',
    'roles',
  ])('recusa autoridade ou dado privado %s', (key) => {
    expect(() =>
      createFanProfileSchema.parse({
        ...command,
        fanProfile: { ...command.fanProfile, [key]: 'synthetic-private-value' },
      }),
    ).toThrow();
    expect(() =>
      createFanProfileSchema.parse({ ...command, [key]: 'synthetic-private-value' }),
    ).toThrow();
  });

  it('resposta própria também usa allowlists estritas', () => {
    const response = {
      session: {
        accountRef: 'acc_' + 'a'.repeat(32),
        accountStatus: 'pending',
        eligibilityStatus: 'review_required',
        emailVerified: true,
        identityVerificationStatus: 'not_started',
        trustLevel: 'basic',
        onboardingState: 'ready',
      },
      fanDomain: {
        fanProfile: {
          ...command.fanProfile,
          fanProfileRef: 'fan_' + 'b'.repeat(32),
        },
        connectionIntents: command.connectionIntents,
        connectionPreference: command.connectionPreference,
      },
    };
    expect(fanProfileResponseSchema.parse(response)).toEqual(response);
    expect(() =>
      fanProfileResponseSchema.parse({
        ...response,
        cpf: 'synthetic-invalid',
      }),
    ).toThrow();
  });
});
