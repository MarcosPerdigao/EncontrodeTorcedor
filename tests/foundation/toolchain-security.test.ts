import { createRequire } from 'node:module';

import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const cliRequire = createRequire(require.resolve('firebase-tools/package.json'));

describe('correções da ferramenta local', { timeout: 30_000 }, () => {
  it.each([
    'stream-json',
    'stream-json/filters/Pick',
    'stream-json/filters/Filter',
    'stream-json/streamers/StreamArray',
    'stream-json/streamers/StreamObject',
  ])('remove o parser vulnerável e bloqueia %s', (specifier) => {
    expect(cliRequire.resolve(specifier).replaceAll('\\', '/')).toContain(
      'tools/disabled-json-import/disabled.cjs',
    );
    const pipeline: unknown = cliRequire(specifier);
    if (typeof pipeline !== 'function') throw new Error('Bloqueio de pipeline ausente.');
    expect(() => pipeline()).toThrow('JSON import pipelines are disabled');
    expect(() => Reflect.construct(pipeline, [])).toThrow('JSON import pipelines are disabled');
    for (const key of [
      'parser',
      'pick',
      'filter',
      'streamArray',
      'streamObject',
      'withParser',
      'make',
    ]) {
      const factory: unknown = Reflect.get(pipeline, key);
      if (typeof factory !== 'function') throw new Error('Fábrica sem bloqueio.');
      expect(() => factory()).toThrow('JSON import pipelines are disabled');
    }
  });

  it('mantém geração de IDs do Xcode com uuid corrigido', () => {
    const xcode = require('xcode') as {
      project: (path: string) => {
        hash: { project: { objects: Record<string, never> } };
        generateUuid: () => string;
      };
    };
    const project = xcode.project('synthetic.pbxproj');
    project.hash = { project: { objects: {} } };
    expect(project.generateUuid()).toMatch(/^[A-F0-9]{24}$/);
  });

  it('mantém API CSV usada pelo CLI com versão corrigida', () => {
    const csv = cliRequire('csv-parse/sync') as {
      parse: (input: string, options: { columns: boolean }) => unknown;
    };
    expect(csv.parse('name,value\nsynthetic,1', { columns: true })).toEqual([
      { name: 'synthetic', value: '1' },
    ]);
  });

  it('preserva a API de propagação usada pelo cliente PubSub da ferramenta', () => {
    const pubsubRequire = createRequire(cliRequire.resolve('@google-cloud/pubsub/package.json'));
    const core = pubsubRequire('@opentelemetry/core') as {
      W3CTraceContextPropagator: new () => { fields: () => string[] };
    };
    expect(new core.W3CTraceContextPropagator().fields()).toEqual(['traceparent', 'tracestate']);
  });
});
