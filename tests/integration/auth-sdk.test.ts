import { randomUUID } from 'node:crypto';
import { initializeApp, deleteApp } from 'firebase/app';
import {
  applyActionCode,
  confirmPasswordReset,
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  initializeAuth,
  inMemoryPersistence,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { expect, it } from 'vitest';

it('SDK Auth: cadastro, confirmação de e-mail, login e recuperação em memória', async () => {
  if (process.env.FIREBASE_AUTH_EMULATOR_HOST !== '127.0.0.1:9099')
    throw new Error('Local Auth required');
  const app = initializeApp(
    { apiKey: 'synthetic-demo-key', projectId: 'demo-social-foundation' },
    'sdk-integration',
  );
  const auth = initializeAuth(app, { persistence: inMemoryPersistence });
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  const email = 'synthetic-sdk-' + randomUUID() + '@example.invalid';
  const password = 'Synthetic-' + randomUUID();
  async function code(type: string) {
    const response = await fetch(
      'http://127.0.0.1:9099/emulator/v1/projects/demo-social-foundation/oobCodes',
    );
    const payload = (await response.json()) as {
      oobCodes: { email: string; requestType: string; oobCode: string }[];
    };
    const selected = payload.oobCodes.find((x) => x.email === email && x.requestType === type);
    if (!selected) throw new Error('Synthetic action code missing');
    return selected.oobCode;
  }
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    expect(credential.user.emailVerified).toBe(false);
    await sendEmailVerification(credential.user);
    await applyActionCode(auth, await code('VERIFY_EMAIL'));
    await credential.user.reload();
    expect(credential.user.emailVerified).toBe(true);
    await signOut(auth);
    await sendPasswordResetEmail(auth, email);
    const replacement = 'Synthetic-' + randomUUID();
    await confirmPasswordReset(auth, await code('PASSWORD_RESET'), replacement);
    const login = await signInWithEmailAndPassword(auth, email, replacement);
    const response = await fetch(
      'http://127.0.0.1:5001/demo-social-foundation/us-central1/accountApi/session/bootstrap',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + (await login.user.getIdToken()),
        },
        body: '{}',
      },
    );
    expect(response.status).toBe(200);
    const body = (await response.json()) as { session: { emailVerified: boolean } };
    expect(body.session.emailVerified).toBe(true);
    await signOut(auth);
    expect(auth.currentUser).toBeNull();
  } finally {
    await deleteApp(app);
  }
});
