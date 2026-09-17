import { describe, expect, it } from 'vitest';
import { createAccountService, digest } from '../../functions/src/service.js';
import type { Store, Transaction } from '../../functions/src/platform/store.js';

function fixture() {
  const documents = new Map<string, Record<string, unknown>>();
  let time = Date.parse('2026-09-17T12:00:00Z');
  const store: Store = {
    async transact<T>(work: (tx: Transaction) => Promise<T>): Promise<T> {
      const staged = structuredClone(documents);
      const result = await work({
        get: async (path) => structuredClone(staged.get(path)),
        set: (path, value) => {
          staged.set(path, structuredClone(value));
        },
      });
      documents.clear();
      for (const [path, value] of staged) documents.set(path, value);
      return result;
    },
  };
  return {
    documents,
    service: createAccountService(store, () => time),
    advance: (ms: number) => {
      time += ms;
    },
    now: () => time,
    actor: { uid: 'synthetic-owner', emailVerified: true, authTime: Math.floor(time / 1000) },
  };
}
describe('transações e sessão lógica', () => {
  it('tentativas de completar rejeitadas consomem limite e janela seguinte recupera', async () => {
    const f = fixture();
    const boot = await f.service('bootstrap', f.actor, {});
    for (let i = 0; i < 5; i++) {
      await expect(
        f.service(
          'complete',
          { ...f.actor, emailVerified: false },
          { birthDate: '2000-01-01', requestKey: 'synthetic-key-0001' },
          boot.sessionToken,
        ),
      ).rejects.toThrow('forbidden');
    }
    await expect(
      f.service(
        'complete',
        f.actor,
        { birthDate: '2000-01-01', requestKey: 'synthetic-key-0001' },
        boot.sessionToken,
      ),
    ).rejects.toThrow('rate_limited');
    f.advance(60_000);
    await expect(
      f.service(
        'complete',
        f.actor,
        { birthDate: '2000-01-01', requestKey: 'synthetic-key-0001' },
        boot.sessionToken,
      ),
    ).resolves.toMatchObject({ session: { eligibilityStatus: 'review_required' } });
  });
  it('após revogação só nova autenticação posterior ao corte abre sessão', async () => {
    const f = fixture();
    const boot = await f.service('bootstrap', f.actor, {});
    await f.service('revoke', f.actor, {}, boot.sessionToken);
    await expect(f.service('bootstrap', f.actor, {})).rejects.toThrow('unauthenticated');
    f.advance(2000);
    const actor = { ...f.actor, authTime: Math.floor(f.now() / 1000) };
    await expect(f.service('bootstrap', actor, {})).resolves.toMatchObject({
      session: { accountRef: boot.session.accountRef },
    });
  });
  it('revogar exige autenticação recente mesmo com sessão não expirada', async () => {
    const f = fixture();
    const boot = await f.service('bootstrap', f.actor, {});
    f.advance(301_000);
    await expect(f.service('revoke', f.actor, {}, boot.sessionToken)).rejects.toThrow(
      'unauthenticated',
    );
  });
  it('sessão expira e versão alterada invalida rebootstrap', async () => {
    const f = fixture();
    const boot = await f.service('bootstrap', f.actor, {});
    f.advance(3_600_000);
    await expect(f.service('state', f.actor, {}, boot.sessionToken)).rejects.toThrow(
      'unauthenticated',
    );
    const path = 'accounts/' + digest(f.actor.uid);
    const current = f.documents.get(path);
    if (!current) throw new Error('fixture missing');
    f.documents.set(path, { ...current, sessionVersion: 1 });
    await expect(f.service('bootstrap', f.actor, {})).rejects.toThrow('unauthenticated');
  });
  it('nascimento inválido não deixa identidade parcial', async () => {
    const f = fixture();
    const boot = await f.service('bootstrap', f.actor, {});
    await expect(
      f.service(
        'complete',
        f.actor,
        { birthDate: '2008-02-30', requestKey: 'synthetic-key-0001' },
        boot.sessionToken,
      ),
    ).rejects.toThrow('invalid_request');
    expect(f.documents.has('identities/' + digest(f.actor.uid))).toBe(false);
  });
  it('não mantém credencial de sessão bruta no banco', async () => {
    const f = fixture();
    const boot = await f.service('bootstrap', f.actor, {});
    expect(boot.sessionToken).toHaveLength(43);
    expect(JSON.stringify([...f.documents])).not.toContain(boot.sessionToken);
  });
  it('dado administrativo inesperado falha fechado sem devolvê-lo', async () => {
    const f = fixture();
    const boot = await f.service('bootstrap', f.actor, {});
    const path = 'accounts/' + digest(f.actor.uid);
    f.documents.set(path, { ...f.documents.get(path), unexpectedPrivateField: 'synthetic' });
    await expect(f.service('state', f.actor, {}, boot.sessionToken)).rejects.toThrow();
  });
});
