import { z } from 'zod';

// Formato de protocolo, não prova de autorização ou de aleatoriedade.
// Geração e resolução no servidor pertencem a etapas futuras.
const profileReference = z.string().regex(/^prf_[A-Za-z0-9_-]{32}$/);
const photoReference = z.string().regex(/^med_[A-Za-z0-9_-]{32}$/);

/** Allowlist explícita. Campos extras são rejeitados, nunca silenciosamente publicados. */
export const publicProfileSchema = z.strictObject({
  profileRef: profileReference,
  nickname: z.string().trim().min(1).max(32),
  age: z.number().int().min(18).max(120),
  city: z.string().trim().min(1).max(80),
  bio: z.string().max(500),
  photoRefs: z.array(photoReference).max(6),
  interests: z.array(z.string().trim().min(1).max(40)).max(12),
  goals: z
    .array(z.enum(['relationship', 'friendship', 'companionship']))
    .min(1)
    .max(3),
});

export type PublicProfileDTO = z.infer<typeof publicProfileSchema>;

/** Fronteira de contrato; não é mapper de documento Firestore nem implementação de perfil. */
export function parsePublicProfileDTO(input: unknown): PublicProfileDTO {
  return publicProfileSchema.parse(input);
}
