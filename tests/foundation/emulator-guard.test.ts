import { spawnSync } from 'node:child_process';

import { describe, expect, it } from 'vitest';

describe('executor de emuladores: proteção contra ambiente real', () => {
  it.each(['FIREBASE_PROJECT_ID', 'GCLOUD_PROJECT', 'GOOGLE_CLOUD_PROJECT'])(
    'recusa %s com projeto fora do demo antes de iniciar o CLI',
    (variable) => {
      const result = spawnSync(process.execPath, ['scripts/run-emulators.mjs', 'test'], {
        encoding: 'utf8',
        env: {
          ...process.env,
          FIREBASE_PROJECT_ID: 'demo-social-foundation',
          GCLOUD_PROJECT: 'demo-social-foundation',
          GOOGLE_CLOUD_PROJECT: 'demo-social-foundation',
          [variable]: 'synthetic-non-demo-project',
        },
      });
      expect(result.status).not.toBe(0);
      expect(result.stderr).toContain('deve ser o projeto demo');
    },
  );

  it.each(['GOOGLE_APPLICATION_CREDENTIALS', 'FIREBASE_TOKEN'])(
    'recusa credencial herdada por %s',
    (variable) => {
      const result = spawnSync(process.execPath, ['scripts/run-emulators.mjs', 'test'], {
        encoding: 'utf8',
        env: {
          ...process.env,
          FIREBASE_PROJECT_ID: 'demo-social-foundation',
          GCLOUD_PROJECT: 'demo-social-foundation',
          GOOGLE_CLOUD_PROJECT: 'demo-social-foundation',
          [variable]: 'synthetic-placeholder',
        },
      });
      expect(result.status).not.toBe(0);
      expect(result.stderr).toContain('Remova credenciais');
    },
  );
});
