import { z } from 'zod';

/** Autoridade exclusiva do servidor. Não é campo de comando do cliente. */
export const trustLevelSchema = z.enum(['basic', 'verified', 'restricted', 'suspended', 'banned']);
export type TrustLevel = z.infer<typeof trustLevelSchema>;

export const participatingTrustLevelSchema = z.enum(['basic', 'verified']);
export type ParticipatingTrustLevel = z.infer<typeof participatingTrustLevelSchema>;
