import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

function read(path: string): string {
  return readFileSync(path, 'utf8');
}
function normalized(path: string): string {
  return read(path).replace(/\s+/g, ' ').trim();
}

describe('política fechada da fundação', () => {
  it('Firestore tem somente o wildcard recursivo de negação', () => {
    expect(normalized('firebase/firestore.rules')).toBe(
      "rules_version = '2'; service cloud.firestore { match /databases/{database}/documents { match /{document=**} { allow read, write: if false; } } }",
    );
  });

  it('Storage tem somente o wildcard recursivo de negação', () => {
    expect(normalized('firebase/storage.rules')).toBe(
      "rules_version = '2'; service firebase.storage { match /b/{bucket}/o { match /{object=**} { allow read, write: if false; } } }",
    );
  });

  it('não configura projetos reais e mantém emuladores em loopback', () => {
    const config = JSON.parse(read('firebase.json')) as {
      emulators: Record<string, { host?: string; enabled?: boolean } | boolean>;
      firestore: { rules: string };
      storage: { rules: string };
    };
    expect(config.firestore.rules).toBe('firebase/firestore.rules');
    expect(config.storage.rules).toBe('firebase/storage.rules');
    for (const [name, emulator] of Object.entries(config.emulators)) {
      if (name !== 'ui' && typeof emulator === 'object') expect(emulator.host).toBe('127.0.0.1');
    }
    const environments: unknown = JSON.parse(read('config/environments.json'));
    expect(environments).toEqual({
      development: { provisioned: false, emulatorOnly: true, projectId: 'demo-social-foundation' },
      staging: { provisioned: false, projectId: null },
      production: { provisioned: false, projectId: null },
    });
  });

  it('mobile usa somente Firebase App/Auth, sem acesso direto a negócio', () => {
    const source = read('apps/mobile/src/auth.ts');
    const imports = [...source.matchAll(/from ['"](firebase[^'"]*)['"]/g)].map((match) => match[1]);
    expect(imports.sort()).toEqual(['firebase/app', 'firebase/auth']);
    expect(source).toContain('inMemoryPersistence');
    expect(source).not.toMatch(/firebase\/(?:firestore|storage|database)/);
  });

  it('entrypoint de contratos não exporta PrivateUserData ou módulos internos', () => {
    const manifest = JSON.parse(read('packages/contracts/package.json')) as {
      exports: Record<string, unknown>;
    };
    expect(Object.keys(manifest.exports)).toEqual(['.']);
    const entrypoint = read('packages/contracts/src/index.ts');
    expect(entrypoint).not.toMatch(/export\s+\*/);
    expect(entrypoint).not.toMatch(/PrivateUserData|from\s+['"].*(?:server|private-user-data)/);
  });
});
