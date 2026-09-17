/** Fail closed: no real Firebase binding or production deployment in this stage. */
export function assertLocalRuntime(env: NodeJS.ProcessEnv): void {
  if (
    env.FUNCTIONS_EMULATOR !== 'true' ||
    env.GCLOUD_PROJECT !== 'demo-social-foundation' ||
    env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8080' ||
    env.FIREBASE_AUTH_EMULATOR_HOST !== '127.0.0.1:9099'
  ) {
    throw new Error('Only the explicitly configured local demo runtime is supported.');
  }
}
export interface AppAttestation {
  verify(token: string | undefined): Promise<void>;
}
/** Isolated local adapter; real attestation must be implemented before a real environment. */
export function localAttestation(env: NodeJS.ProcessEnv): AppAttestation {
  assertLocalRuntime(env);
  return {
    verify: async () => {
      assertLocalRuntime(env);
    },
  };
}
