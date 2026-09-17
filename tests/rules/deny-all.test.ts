import { readFile } from 'node:fs/promises';

import {
  assertFails,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getCountFromServer,
  onSnapshot,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import {
  deleteObject,
  getBytes,
  getDownloadURL,
  getMetadata,
  listAll,
  ref,
  updateMetadata,
  uploadBytes,
} from 'firebase/storage';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const projectId = 'demo-social-foundation';
let environment: RulesTestEnvironment;

const actors = ['anonymous', 'owner', 'other', 'moderator', 'admin'] as const;
type Actor = (typeof actors)[number];
const collections = [
  'accounts',
  'identities',
  'profiles',
  'preferences',
  'consents',
  'media',
  'discoverySessions',
  'pairStates',
  'decisions',
  'matches',
  'reports',
  'reportEvidence',
  'moderationActions',
  'devices',
  'signals',
  'privacyRequests',
  'rateLimits',
  'operations',
  'outbox',
  'staffAccess',
  'auditEvents',
  'unknown',
];
const paths = [
  'accounts/synthetic-a',
  'identities/synthetic-a',
  'profiles/synthetic-a',
  'identities/synthetic-b',
  'signals/synthetic-a',
  'staffAccess/synthetic-a',
  'reports/synthetic-report',
  'matches/synthetic-b-c/messages/synthetic-message',
  'unknown/synthetic-a/deeper/synthetic-b',
];
const objects = [
  'private/synthetic-a/photo.bin',
  'private/synthetic-b/photo.bin',
  'unknown/deep/photo.bin',
];
const bytes = new TextEncoder().encode('synthetic fixture; no real personal data');

function context(actor: Actor) {
  if (actor === 'anonymous') return environment.unauthenticatedContext();
  const uid = actor === 'other' ? 'synthetic-b' : 'synthetic-a';
  return environment.authenticatedContext(uid, {
    email_verified: true,
    role: actor === 'owner' || actor === 'other' ? 'user' : actor,
    admin: actor === 'admin',
    moderator: actor === 'moderator',
  });
}

beforeAll(async () => {
  // Não descobrir automaticamente hosts/projetos: impedir testes contra recursos reais.
  if (
    process.env.FIREBASE_PROJECT_ID !== projectId ||
    process.env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8080' ||
    process.env.FIREBASE_STORAGE_EMULATOR_HOST !== '127.0.0.1:9199'
  ) {
    throw new Error(
      'Execute npm run test:rules: os dois emuladores locais e projeto demo são obrigatórios.',
    );
  }

  console.info('Fixtures: carregando regras nos emuladores locais.');
  environment = await initializeTestEnvironment({
    projectId,
    firestore: {
      host: '127.0.0.1',
      port: 8080,
      rules: await readFile('firebase/firestore.rules', 'utf8'),
    },
    storage: {
      host: '127.0.0.1',
      port: 9199,
      rules: await readFile('firebase/storage.rules', 'utf8'),
    },
  });
  console.info('Fixtures: limpando dados sintéticos.');
  await environment.clearFirestore();
  await environment.clearStorage();
  console.info('Fixtures: semeando documentos e objetos sintéticos.');
  await environment.withSecurityRulesDisabled(async (admin) => {
    for (const path of paths) await setDoc(doc(admin.firestore(), path), { fixture: true });
    for (const path of objects) await uploadBytes(ref(admin.storage(), path), bytes);
  });
});

afterAll(async () => {
  if (environment) await environment.cleanup();
});

it('controle: dados e objetos existem; negações não são falhas de rede', async () => {
  await environment.withSecurityRulesDisabled(async (admin) => {
    expect((await getDoc(doc(admin.firestore(), paths[0] ?? ''))).exists()).toBe(true);
    expect((await getMetadata(ref(admin.storage(), objects[0]))).size).toBe(bytes.length);
    expect(new Uint8Array(await getBytes(ref(admin.storage(), objects[0])))).toEqual(bytes);
  });
});

describe.each(actors)('cliente %s', (actor) => {
  it.each(['accountStatus', 'eligibilityStatus', 'sessionVersion', 'identityVerificationStatus'])(
    'não forja campo de conta %s',
    async (field) => {
      const database = context(actor).firestore();
      await assertFails(
        setDoc(
          doc(database, 'accounts/synthetic-a'),
          { [field]: 'synthetic-forged' },
          { merge: true },
        ),
      );
      await assertFails(
        setDoc(doc(database, 'accounts/synthetic-new'), { [field]: 'synthetic-forged' }),
      );
    },
  );

  it.each(collections)('não lista a collection %s', async (name) => {
    await assertFails(getDocs(collection(context(actor).firestore(), name)));
  });

  it.each(paths)('não lê/cria/altera/exclui %s', async (path) => {
    const database = context(actor).firestore();
    const target = doc(database, path);
    await assertFails(getDoc(target));
    await assertFails(setDoc(target, { attackerControlled: true }));
    await assertFails(updateDoc(target, { admin: true }));
    await assertFails(deleteDoc(target));
    await assertFails(setDoc(doc(database, `${path}-new`), { fixture: true }));
  });

  it('não enumera collection group ou contagem agregada', async () => {
    const database = context(actor).firestore();
    await assertFails(getDocs(collectionGroup(database, 'messages')));
    await assertFails(getCountFromServer(collection(database, 'profiles')));
  });

  it('não escreve em lote para forjar match e papel administrativo', async () => {
    const database = context(actor).firestore();
    const batch = writeBatch(database);
    batch.set(doc(database, 'matches/arbitrary'), { participants: ['synthetic-a', 'synthetic-b'] });
    batch.set(doc(database, 'staffAccess/synthetic-a'), { role: 'admin' });
    await assertFails(batch.commit());
  });

  it('não recebe dados por listener, inclusive signals próprio', async () => {
    const target = doc(context(actor).firestore(), 'signals/synthetic-a');
    await assertFails(
      new Promise<void>((resolve, reject) => {
        const unsubscribe = onSnapshot(
          target,
          () => {
            unsubscribe();
            resolve();
          },
          (error) => {
            unsubscribe();
            reject(error);
          },
        );
      }),
    );
  });

  it.each(objects)('não lê ou modifica objeto Storage %s', async (path) => {
    const object = ref(context(actor).storage(), path);
    await assertFails(getMetadata(object));
    await assertFails(getBytes(object));
    await assertFails(getDownloadURL(object));
    await assertFails(uploadBytes(object, bytes));
    await assertFails(updateMetadata(object, { customMetadata: { admin: 'true' } }));
    await assertFails(deleteObject(object));
    await assertFails(uploadBytes(ref(context(actor).storage(), `${path}-new`), bytes));
  });

  it('não lista Storage, mesmo em caminho desconhecido', async () => {
    await assertFails(listAll(ref(context(actor).storage())));
    await assertFails(listAll(ref(context(actor).storage(), 'unknown')));
  });
});
