import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

import { inspectFile } from './secret-patterns.mjs';

const files = [
  ...new Set(
    execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], {
      encoding: 'utf8',
    })
      .split('\0')
      .filter(Boolean),
  ),
];
let count = 0;
for (const file of files) {
  const findings = inspectFile(file, readFileSync(file, 'utf8'));
  for (const label of findings) {
    // Nunca imprimir o conteúdo suspeito: não vazar secrets pelo próprio scanner.
    console.error(`${file}: ${label}`);
    count += 1;
  }
}
console.log(
  `Secret scan: ${files.length} arquivos versionados/candidatos; ${count} ocorrência(s).`,
);
if (count > 0) process.exitCode = 1;
