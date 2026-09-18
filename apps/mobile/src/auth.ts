import { initializeApp } from 'firebase/app';
import {
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  initializeAuth,
  inMemoryPersistence,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { Platform } from 'react-native';
import {
  bootstrapResponseSchema,
  fanProfileResponseSchema,
  sessionResponseSchema,
  type CreateFanProfileCommand,
  type FanProfileResponse,
  type SessionDTO,
} from '@social/contracts';

let runtime: ReturnType<typeof initializeAuth> | undefined;
let applicationSession: string | undefined;
const host = Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1';
const apiBase = 'http://' + host + ':5001/demo-social-foundation/us-central1/accountApi';
function auth() {
  if (!__DEV__) throw new Error('Este ambiente ainda não está disponível.');
  if (!runtime) {
    const app = initializeApp({
      apiKey: 'synthetic-demo-key',
      projectId: 'demo-social-foundation',
      appId: '1:000000000000:android:synthetic',
    });
    runtime = initializeAuth(app, { persistence: inMemoryPersistence });
    connectAuthEmulator(runtime, 'http://' + host + ':9099', { disableWarnings: true });
  }
  return runtime;
}
async function request(path: string, body: unknown) {
  const user = auth().currentUser;
  if (!user) throw new Error('Não foi possível continuar. Entre novamente.');
  const idToken = await user.getIdToken(true);
  const response = await fetch(apiBase + path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + idToken,
      ...(applicationSession ? { 'X-App-Session': applicationSession } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) applicationSession = undefined;
    throw new Error('Não foi possível continuar. Confira sua sessão ou tente mais tarde.');
  }
  return (await response.json()) as unknown;
}
export async function enter(
  email: string,
  password: string,
  register: boolean,
): Promise<SessionDTO> {
  applicationSession = undefined;
  try {
    if (register) {
      const credential = await createUserWithEmailAndPassword(auth(), email.trim(), password);
      await sendEmailVerification(credential.user);
    } else {
      await signInWithEmailAndPassword(auth(), email.trim(), password);
    }
    return await refreshSession();
  } catch {
    await signOut(auth()).catch(() => undefined);
    throw new Error(
      'Não foi possível entrar ou concluir o cadastro. Confira os dados ou tente recuperar o acesso.',
    );
  }
}
export async function refreshSession(): Promise<SessionDTO> {
  if (applicationSession)
    return sessionResponseSchema.parse(await request('/session/state', {})).session;
  const result = bootstrapResponseSchema.parse(await request('/session/bootstrap', {}));
  applicationSession = result.sessionToken;
  return result.session;
}
export async function verifyEmail(): Promise<void> {
  const user = auth().currentUser;
  if (!user) throw new Error('Entre novamente.');
  await sendEmailVerification(user);
}
export async function recover(email: string): Promise<void> {
  // Provider differences are not rendered; this is not endpoint-level enumeration protection.
  await sendPasswordResetEmail(auth(), email.trim()).catch(() => undefined);
}
export async function completeAccount(birthDate: string): Promise<SessionDTO> {
  return sessionResponseSchema.parse(
    await request('/account/complete', {
      birthDate,
      requestKey: 'initial-birth-date-v1',
    }),
  ).session;
}
export async function leave(): Promise<boolean> {
  let revoked = false;
  try {
    await request('/session/revoke', {});
    revoked = true;
  } catch {
    /* Local logout must still happen. */
  } finally {
    applicationSession = undefined;
    await signOut(auth());
  }
  return revoked;
}

export async function createFanProfile(
  command: Omit<CreateFanProfileCommand, 'requestKey'>,
): Promise<FanProfileResponse> {
  return fanProfileResponseSchema.parse(
    await request('/fan-profile/create', {
      ...command,
      requestKey: 'initial-fan-profile-v1',
    }),
  );
}
