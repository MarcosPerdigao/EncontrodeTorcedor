import { z } from 'zod';
import { fanDomainSchema, fanProfileSchema } from './fan-domain.js';
import { sessionSchema } from './session.js';

const fanProfileDraftSchema = z
  .strictObject({
    primaryClubId: fanProfileSchema.shape.primaryClubId,
    intensity: fanProfileSchema.shape.intensity,
    favoriteIdolIds: fanProfileSchema.shape.favoriteIdolIds,
    stadiumExperience: fanProfileSchema.shape.stadiumExperience,
    supporterHistory: fanProfileSchema.shape.supporterHistory,
    clubPreferences: fanProfileSchema.shape.clubPreferences,
  })
  .superRefine((draft, context) => {
    const result = fanProfileSchema.safeParse({
      ...draft,
      fanProfileRef: 'fan_' + 'x'.repeat(32),
    });
    if (!result.success) {
      for (const issue of result.error.issues) {
        context.addIssue({ code: 'custom', path: issue.path, message: issue.message });
      }
    }
  });

export const createFanProfileSchema = z.strictObject({
  fanProfile: fanProfileDraftSchema,
  connectionIntents: fanDomainSchema.shape.connectionIntents,
  connectionPreference: fanDomainSchema.shape.connectionPreference,
  lifestyleProfile: fanDomainSchema.shape.lifestyleProfile,
  requestKey: z.string().regex(/^[A-Za-z0-9_-]{16,80}$/),
});
export type CreateFanProfileCommand = z.infer<typeof createFanProfileSchema>;

export const fanProfileResponseSchema = z.strictObject({
  session: sessionSchema,
  fanDomain: fanDomainSchema,
});
export type FanProfileResponse = z.infer<typeof fanProfileResponseSchema>;
