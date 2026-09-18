import type { FanCatalog } from '@social/contracts';

/** Local-only fixtures. They are fictional and are not a production catalog. */
export const localFanCatalog: FanCatalog = {
  clubs: [
    {
      id: 'club_aaaaaaaaaaaaaaaaaaaaaaaa',
      name: 'Clube Horizonte',
      shortName: 'Horizonte',
      aliases: ['Horizonte FC'],
      country: 'BR',
      region: 'Região de Teste',
      status: 'active',
      createdAt: '2026-01-02T03:04:05.000Z',
      updatedAt: '2026-01-02T03:04:05.000Z',
    },
    {
      id: 'club_bbbbbbbbbbbbbbbbbbbbbbbb',
      name: 'União das Estrelas',
      shortName: 'Estrelas',
      aliases: [],
      country: 'BR',
      region: 'Região de Teste',
      status: 'active',
      createdAt: '2026-01-02T03:04:05.000Z',
      updatedAt: '2026-01-02T03:04:05.000Z',
    },
  ],
  idols: [
    {
      idolId: 'idol_cccccccccccccccccccccccc',
      canonicalName: 'Alex da Serra',
      aliases: ['A10', 'Alex Serra'],
      relatedClubIds: ['club_aaaaaaaaaaaaaaaaaaaaaaaa'],
      status: 'active',
      createdAt: '2026-01-02T03:04:05.000Z',
      updatedAt: '2026-01-02T03:04:05.000Z',
    },
  ],
};
