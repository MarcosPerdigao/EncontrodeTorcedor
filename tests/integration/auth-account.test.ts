import { createHash, randomUUID } from 'node:crypto';
import { initializeApp, deleteApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import {
  bootstrapResponseSchema,
  fanProfileResponseSchema,
  sessionResponseSchema,
} from '../../packages/contracts/src/index.js';

const project = 'demo-social-foundation';
const apiUrl = 'http://127.0.0.1:5001/' + project + '/us-central1/accountApi';
const authUrl = 'http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:';
const digest = (s: string) => createHash('sha256').update(s).digest('hex');
let app: ReturnType<typeof initializeApp>;
let auth: ReturnType<typeof getAuth>;
let database: ReturnType<typeof getFirestore>;
const password = () => 'Synthetic-' + randomUUID();
async function provider(operation: string, body: unknown) {
  const response = await fetch(authUrl + operation + '?key=synthetic-demo-key', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { status: response.status, body: (await response.json()) as Record<string, unknown> };
}
async function user(verified = true) {
  const email = 'synthetic-' + randomUUID() + '@example.invalid';
  const secret = password();
  const signup = await provider('signUp', { email, password: secret, returnSecureToken: true });
  expect(signup.status).toBe(200);
  const uid = String(signup.body.localId);
  await auth.updateUser(uid, { emailVerified: verified });
  const login = await provider('signInWithPassword', {
    email,
    password: secret,
    returnSecureToken: true,
  });
  expect(login.status).toBe(200);
  return { uid, token: String(login.body.idToken), email, secret };
}
async function api(path: string, token: string, body: unknown = {}, session?: string) {
  const response = await fetch(apiUrl + path, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      Authorization: 'Bearer ' + token,
      ...(session ? { 'X-App-Session': session } : {}),
    },
    body: JSON.stringify(body),
  });
  expect(response.headers.get('cache-control')).toBe('no-store');
  return { status: response.status, body: (await response.json()) as Record<string, unknown> };
}
async function boot(token: string) {
  const response = await api('/session/bootstrap', token);
  expect(response.status).toBe(200);
  return bootstrapResponseSchema.parse(response.body);
}
beforeAll(async () => {
  if (
    process.env.GCLOUD_PROJECT !== project ||
    process.env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8080' ||
    process.env.FIREBASE_AUTH_EMULATOR_HOST !== '127.0.0.1:9099'
  )
    throw new Error('Local emulators required');
  app = initializeApp({ projectId: project }, 'integration-tests');
  auth = getAuth(app);
  database = getFirestore(app);
});
afterAll(async () => {
  if (app) await deleteApp(app);
});
describe('HTTP real + Auth/Firestore/Functions emulados', () => {
  it('token inválido e anônimo não criam conta', async () => {
    expect((await api('/session/bootstrap', 'invalid')).status).toBe(401);
    expect((await api('/session/bootstrap', '')).status).toBe(401);
  });
  it('não oferece listagem ou seleção de terceiro', async () => {
    const a = await user();
    expect((await api('/users', a.token)).status).toBe(400);
    expect((await api('/session/bootstrap', a.token, { uid: 'synthetic-victim' })).status).toBe(
      400,
    );
    expect((await database.doc('accounts/' + digest('synthetic-victim')).get()).exists).toBe(false);
  });
  it('bootstrap concorrente cria uma conta e referências estáveis', async () => {
    const a = await user();
    const values = await Promise.all([boot(a.token), boot(a.token), boot(a.token)]);
    expect(new Set(values.map((x) => x.session.accountRef)).size).toBe(1);
    expect(values[0]?.session.accountStatus).toBe('pending');
    expect(values[0]?.session.identityVerificationStatus).toBe('not_started');
  });
  it('sessão alheia não dá acesso e UID extra é rejeitado', async () => {
    const a = await user();
    const b = await user();
    const session = await boot(a.token);
    await boot(b.token);
    expect((await api('/session/state', b.token, {}, session.sessionToken)).status).toBe(401);
    expect(
      (await api('/session/state', a.token, { uid: b.uid }, session.sessionToken)).status,
    ).toBe(400);
  });
  it.each(['suspended', 'banned', 'deletion_pending', 'deleted'])(
    'estado %s revoga acesso com token válido e claims admin',
    async (status) => {
      const a = await user();
      const session = await boot(a.token);
      await auth.setCustomUserClaims(a.uid, {
        admin: true,
        accountStatus: 'active',
        sessionVersion: 999,
      });
      const privilegedLogin = await provider('signInWithPassword', {
        email: a.email,
        password: a.secret,
        returnSecureToken: true,
      });
      expect(privilegedLogin.status).toBe(200);
      a.token = String(privilegedLogin.body.idToken);
      await database.doc('accounts/' + digest(a.uid)).update({ accountStatus: status });
      expect((await api('/session/state', a.token, {}, session.sessionToken)).status).toBe(403);
      expect((await api('/session/bootstrap', a.token)).status).toBe(403);
      expect(
        (
          await api(
            '/account/complete',
            a.token,
            { birthDate: '2000-01-01', requestKey: 'synthetic-key-0001' },
            session.sessionToken,
          )
        ).status,
      ).toBe(403);
    },
  );
  it('inelegível perde acesso a todas as operações', async () => {
    const a = await user();
    const session = await boot(a.token);
    await database.doc('accounts/' + digest(a.uid)).update({ eligibilityStatus: 'ineligible' });
    expect((await api('/session/state', a.token, {}, session.sessionToken)).status).toBe(403);
    expect((await api('/session/bootstrap', a.token)).status).toBe(403);
  });
  it('sessionVersion invalida sessão e novo bootstrap da mesma autenticação', async () => {
    const a = await user();
    const session = await boot(a.token);
    await database.doc('accounts/' + digest(a.uid)).update({ sessionVersion: 1 });
    expect((await api('/session/state', a.token, {}, session.sessionToken)).status).toBe(401);
    expect((await api('/session/bootstrap', a.token)).status).toBe(401);
  });
  it('revogação exige nova autenticação; token ainda válido não recria sessão', async () => {
    const a = await user();
    const session = await boot(a.token);
    expect((await api('/session/revoke', a.token, {}, session.sessionToken)).status).toBe(200);
    expect((await api('/session/state', a.token, {}, session.sessionToken)).status).toBe(401);
    expect((await api('/session/bootstrap', a.token)).status).toBe(401);
  });
  it('sessão expirada não acessa estado', async () => {
    const a = await user();
    const session = await boot(a.token);
    await database
      .doc('accounts/' + digest(a.uid) + '/sessions/' + digest(session.sessionToken))
      .update({ expiresAt: 0 });
    expect((await api('/session/state', a.token, {}, session.sessionToken)).status).toBe(401);
  });
  it('e-mail não verificado bloqueia completar; estado usa Auth vigente', async () => {
    const a = await user(false);
    const session = await boot(a.token);
    const body = { birthDate: '2000-01-01', requestKey: 'synthetic-key-0001' };
    expect((await api('/account/complete', a.token, body, session.sessionToken)).status).toBe(403);
    await auth.updateUser(a.uid, { emailVerified: true });
    const result = await api('/account/complete', a.token, body, session.sessionToken);
    expect(result.status).toBe(200);
    expect(sessionResponseSchema.parse(result.body).session.eligibilityStatus).toBe(
      'review_required',
    );
  });
  it('adulto declarado não vira verificado/ativo e resposta não contém nascimento/UID', async () => {
    const a = await user();
    const session = await boot(a.token);
    const body = { birthDate: '2000-01-01', requestKey: 'synthetic-key-0001' };
    const response = await api('/account/complete', a.token, body, session.sessionToken);
    const value = sessionResponseSchema.parse(response.body).session;
    expect(value.accountStatus).toBe('pending');
    expect(value.identityVerificationStatus).toBe('not_started');
    expect(value.eligibilityStatus).toBe('review_required');
    expect(JSON.stringify(response.body)).not.toContain(a.uid);
    expect(JSON.stringify(response.body)).not.toContain(body.birthDate);
    expect((await api('/account/complete', a.token, body, session.sessionToken)).status).toBe(200);
    expect(
      (
        await api(
          '/account/complete',
          a.token,
          { ...body, birthDate: '2001-01-01' },
          session.sessionToken,
        )
      ).status,
    ).toBe(409);
    const privateData = (await database.doc('identities/' + digest(a.uid)).get()).data();
    expect(privateData?.birthDate).toBe(body.birthDate);
  });
  it('menor torna-se inelegível e não pode trocar nascimento para contornar', async () => {
    const a = await user();
    const session = await boot(a.token);
    const birthDate = new Date().getUTCFullYear() - 10 + '-01-01';
    const result = await api(
      '/account/complete',
      a.token,
      { birthDate, requestKey: 'synthetic-key-0001' },
      session.sessionToken,
    );
    expect(result.status).toBe(200);
    expect(sessionResponseSchema.parse(result.body).session.eligibilityStatus).toBe('ineligible');
    expect(
      (
        await api(
          '/account/complete',
          a.token,
          { birthDate: '2000-01-01', requestKey: 'synthetic-key-0002' },
          session.sessionToken,
        )
      ).status,
    ).toBe(403);
  });
  it.each([
    'accountStatus',
    'eligibilityStatus',
    'sessionVersion',
    'identityVerificationStatus',
    'cpf',
    'uid',
  ])('não aceita campo de autoridade %s', async (key) => {
    const a = await user();
    const session = await boot(a.token);
    expect(
      (
        await api(
          '/account/complete',
          a.token,
          { birthDate: '2000-01-01', requestKey: 'synthetic-key-0001', [key]: 'synthetic-invalid' },
          session.sessionToken,
        )
      ).status,
    ).toBe(400);
  });
  it('limite por ator não bloqueia outra conta', async () => {
    const a = await user();
    for (let index = 0; index < 6; index++) await boot(a.token);
    expect((await api('/session/bootstrap', a.token)).status).toBe(429);
    await boot((await user()).token);
  });
  it('conta Auth desabilitada é rejeitada', async () => {
    const a = await user();
    const session = await boot(a.token);
    await auth.updateUser(a.uid, { disabled: true });
    expect((await api('/session/state', a.token, {}, session.sessionToken)).status).toBe(401);
  });
  it('mede enumeração do emulador, sem alegar proteção real', async () => {
    const a = await user();
    const duplicate = await provider('signUp', {
      email: a.email,
      password: password(),
      returnSecureToken: true,
    });
    expect(duplicate.status).toBe(400);
    expect(JSON.stringify(duplicate.body)).toContain('EMAIL_EXISTS');
    // This explicitly records the provider limitation; real deployment remains blocked.
  });

  it('cria perfil básico sem verificação e preserva a identidade de torcedor', async () => {
    const a = await user();
    const session = await boot(a.token);
    const command = {
      fanProfile: {
        primaryClubId: 'club_aaaaaaaaaaaaaaaaaaaaaaaa',
        intensity: 'when_possible',
        favoriteIdolIds: ['idol_cccccccccccccccccccccccc'],
        clubPreferences: [
          {
            clubId: 'club_aaaaaaaaaaaaaaaaaaaaaaaa',
            relationshipType: 'supporter',
          },
        ],
      },
      connectionIntents: ['friendship'],
      connectionPreference: { scopes: ['same_club'], specificClubIds: [] },
      requestKey: 'synthetic-profile-0001',
    };
    expect((await api('/fan-profile/create', a.token, command, session.sessionToken)).status).toBe(
      403,
    );
    await api(
      '/account/complete',
      a.token,
      { birthDate: '2000-01-01', requestKey: 'synthetic-birth-0001' },
      session.sessionToken,
    );
    const response = await api('/fan-profile/create', a.token, command, session.sessionToken);
    expect(response.status).toBe(200);
    const created = fanProfileResponseSchema.parse(response.body);
    expect(created.session).toMatchObject({
      identityVerificationStatus: 'not_started',
      trustLevel: 'basic',
      onboardingState: 'ready',
    });
    expect(JSON.stringify(response.body)).not.toContain(a.uid);
    expect(JSON.stringify(response.body).toLowerCase()).not.toContain('cpf');
    expect(JSON.stringify(response.body)).not.toContain('2000-01-01');

    const profilePath = 'fanProfiles/' + digest(a.uid);
    const before = (await database.doc(profilePath).get()).data();
    await database
      .doc('accounts/' + digest(a.uid))
      .update({ identityVerificationStatus: 'verified' });
    const state = await api('/session/state', a.token, {}, session.sessionToken);
    expect(sessionResponseSchema.parse(state.body).session.trustLevel).toBe('verified');
    expect((await database.doc(profilePath).get()).data()).toEqual(before);
  });

  it('recusa catálogo inválido e autoridade de verificação no perfil', async () => {
    const a = await user();
    const session = await boot(a.token);
    await api(
      '/account/complete',
      a.token,
      { birthDate: '2000-01-01', requestKey: 'synthetic-birth-0001' },
      session.sessionToken,
    );
    const base = {
      fanProfile: {
        primaryClubId: 'club_aaaaaaaaaaaaaaaaaaaaaaaa',
        intensity: 'when_possible',
        favoriteIdolIds: [],
        clubPreferences: [],
      },
      connectionIntents: ['friendship'],
      connectionPreference: { scopes: ['same_club'], specificClubIds: [] },
      requestKey: 'synthetic-profile-0001',
    };
    expect(
      (
        await api(
          '/fan-profile/create',
          a.token,
          {
            ...base,
            fanProfile: {
              ...base.fanProfile,
              primaryClubId: 'club_zzzzzzzzzzzzzzzzzzzzzzzz',
            },
          },
          session.sessionToken,
        )
      ).status,
    ).toBe(400);
    expect(
      (
        await api(
          '/fan-profile/create',
          a.token,
          { ...base, identityVerificationStatus: 'verified' },
          session.sessionToken,
        )
      ).status,
    ).toBe(400);
  });
});
