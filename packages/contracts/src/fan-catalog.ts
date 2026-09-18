import { z } from 'zod';

const timestampSchema = z.iso.datetime({ offset: true });
export const clubIdSchema = z.string().regex(/^club_[A-Za-z0-9_-]{24}$/);
export const idolIdSchema = z.string().regex(/^idol_[A-Za-z0-9_-]{24}$/);
export const clubStatusSchema = z.enum(['active', 'inactive', 'under_review']);
export const idolStatusSchema = z.enum(['active', 'under_review', 'ineligible', 'retired']);

const aliasSchema = z.string().trim().min(1).max(80);
export const clubSchema = z.strictObject({
  id: clubIdSchema,
  name: z.string().trim().min(1).max(100),
  shortName: z.string().trim().min(1).max(32),
  aliases: z.array(aliasSchema).max(12),
  country: z.string().trim().length(2).toUpperCase(),
  region: z.string().trim().min(1).max(80).optional(),
  status: clubStatusSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});
export type Club = z.infer<typeof clubSchema>;

export const idolSchema = z.strictObject({
  idolId: idolIdSchema,
  canonicalName: z.string().trim().min(1).max(100),
  aliases: z.array(aliasSchema).min(1).max(20),
  relatedClubIds: z.array(clubIdSchema).min(1).max(12),
  status: idolStatusSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});
export type Idol = z.infer<typeof idolSchema>;

export const fanCatalogSchema = z
  .strictObject({
    clubs: z.array(clubSchema).max(100),
    idols: z.array(idolSchema).max(500),
  })
  .superRefine((catalog, context) => {
    const clubIds = new Set<string>();
    for (const [index, club] of catalog.clubs.entries()) {
      if (clubIds.has(club.id)) {
        context.addIssue({
          code: 'custom',
          path: ['clubs', index, 'id'],
          message: 'duplicate_club_id',
        });
      }
      clubIds.add(club.id);
    }

    const idolIds = new Set<string>();
    const idolAliases = new Map<string, string>();
    for (const [index, idol] of catalog.idols.entries()) {
      if (idolIds.has(idol.idolId)) {
        context.addIssue({
          code: 'custom',
          path: ['idols', index, 'idolId'],
          message: 'duplicate_idol_id',
        });
      }
      idolIds.add(idol.idolId);
      for (const clubId of idol.relatedClubIds) {
        if (!clubIds.has(clubId)) {
          context.addIssue({
            code: 'custom',
            path: ['idols', index, 'relatedClubIds'],
            message: 'unknown_club_id',
          });
        }
      }
      const names = [idol.canonicalName, ...idol.aliases];
      for (const name of names) {
        const normalized = normalizeCatalogAlias(name);
        const owner = idolAliases.get(normalized);
        if (owner && owner !== idol.idolId) {
          context.addIssue({
            code: 'custom',
            path: ['idols', index, 'aliases'],
            message: 'ambiguous_idol_alias',
          });
        }
        idolAliases.set(normalized, idol.idolId);
      }
    }
  });
export type FanCatalog = z.infer<typeof fanCatalogSchema>;

export function normalizeCatalogAlias(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLocaleLowerCase('pt-BR')
    .replace(/\s+/g, ' ');
}

export type IdolResolution =
  { status: 'resolved'; idol: Idol } | { status: 'not_found' } | { status: 'unavailable' };

export function resolveIdolAlias(input: FanCatalog, value: string): IdolResolution {
  const catalog = fanCatalogSchema.parse(input);
  const normalized = normalizeCatalogAlias(value);
  const idol = catalog.idols.find((candidate) =>
    [candidate.canonicalName, ...candidate.aliases].some(
      (alias) => normalizeCatalogAlias(alias) === normalized,
    ),
  );
  if (!idol) return { status: 'not_found' };
  return idol.status === 'active' ? { status: 'resolved', idol } : { status: 'unavailable' };
}
