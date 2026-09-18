import { z } from 'zod';

export const photoReferenceSchema = z.strictObject({
  photoId: z.string().regex(/^med_[A-Za-z0-9_-]{32}$/),
  ownerAccountRef: z.string().regex(/^acc_[A-Za-z0-9_-]{32}$/),
  status: z.enum(['pending', 'ready', 'unavailable']),
  ordering: z.number().int().min(0).max(5),
  moderationStatus: z.enum(['pending', 'approved', 'rejected']),
});
export type PhotoReference = z.infer<typeof photoReferenceSchema>;
