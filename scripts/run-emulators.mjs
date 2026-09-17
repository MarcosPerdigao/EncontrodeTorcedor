import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectId = 'demo-social-foundation';
const mode = process.argv[2];
if (mode !== 'test' && mode !== 'start' && mode !== 'integration') {
  throw new Error('Use test, integration ou start.');
}

for (const variable of ['FIREBASE_PROJECT_ID', 'GCLOUD_PROJECT', 'GOOGLE_CLOUD_PROJECT']) {
  if (process.env[variable] && process.env[variable] !== projectId) {
    throw new Error(`${variable} deve ser o projeto demo da fundação.`);
  }
}

// Não herdar credenciais de serviço para executar fixtures locais.
if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.FIREBASE_TOKEN) {
  throw new Error('Remova credenciais de produção da sessão de testes locais.');
}

const root = fileURLToPath(new URL('../', import.meta.url));
const cli = fileURLToPath(
  new URL('../node_modules/firebase-tools/lib/bin/firebase.js', import.meta.url),
);
const temporaryPath = join(root, '.cache', 'tmp');
mkdirSync(temporaryPath, { recursive: true });
const args = [
  cli,
  mode === 'start' ? 'emulators:start' : 'emulators:exec',
  '--project',
  projectId,
  '--config',
  'firebase.json',
  '--only',
  mode === 'test' ? 'firestore,storage' : 'auth,firestore,storage,functions',
];
if (mode !== 'start')
  args.push(
    '--non-interactive',
    mode === 'test' ? 'npm run test:rules:inside' : 'npm run test:emulators:inside',
  );

const child = spawn(process.execPath, args, {
  cwd: root,
  stdio: 'inherit',
  env: {
    ...process.env,
    FIREBASE_PROJECT_ID: projectId,
    GCLOUD_PROJECT: projectId,
    GOOGLE_CLOUD_PROJECT: projectId,
    FIREBASE_CLI_DISABLE_TELEMETRY: '1',
    FUNCTIONS_DISCOVERY_TIMEOUT: '120',
    FIREBASE_EMULATORS_PATH:
      process.env.FIREBASE_EMULATORS_PATH ?? join(root, '.cache', 'firebase', 'emulators'),
    XDG_CONFIG_HOME: process.env.XDG_CONFIG_HOME ?? join(root, '.cache', 'config'),
    TEMP: temporaryPath,
    TMP: temporaryPath,
  },
});
child.on('error', () => {
  console.error('Não foi possível iniciar o Emulator Suite.');
  process.exitCode = 1;
});
child.on('exit', (code) => {
  process.exitCode = code ?? 1;
});
