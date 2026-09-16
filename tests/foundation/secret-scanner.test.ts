import { describe, expect, it } from 'vitest';

import { inspectFile } from '../../scripts/secret-patterns.mjs';

const inspect = inspectFile;

describe('scanner de secrets', () => {
  it('recusa arquivos de credencial, inclusive se forem forçados no Git', () => {
    for (const path of [
      '.env',
      'functions/.env.production',
      'test.pem',
      'service-account.json',
      'google-services.json',
    ]) {
      expect(inspect(path, '')).not.toEqual([]);
    }
    expect(inspect('.env.example', 'EXPO_PUBLIC_APP_ENV=development')).toEqual([]);
  });

  it.each([
    ['PEM', ['-----BEGIN ', 'PRIVATE KEY-----'].join('')],
    ['Google', ['AI', 'za', 'A'.repeat(35)].join('')],
    ['GitHub', ['gh', 'p_', 'a'.repeat(36)].join('')],
    ['AWS', ['AK', 'IA', 'A'.repeat(16)].join('')],
    ['service account', JSON.stringify({ type: ['service', '_account'].join('') })],
    ['password', ['pass', 'word', ': ', JSON.stringify('synthetic-value-only')].join('')],
  ])('detecta assinatura sintética de %s', (_label, fixture) => {
    expect(inspect('fixture.txt', fixture).length).toBeGreaterThan(0);
  });

  it('não acusa configuração pública fictícia nem documentação sem credencial', () => {
    expect(inspect('config.json', '{"projectId":"demo-social-foundation"}')).toEqual([]);
    expect(inspect('README.md', 'Nunca usar tokens ou service accounts no cliente.')).toEqual([]);
  });
});
