# Desenvolvimento, ambientes e validação

## Workspace

Npm workspaces com apps/mobile, functions e packages/contracts. Nomes técnicos neutros, lockfile único, dependências fixadas e TypeScript strict. ESLint impede `any` explícito, importação de módulos privados e SDKs Firebase no mobile nesta etapa. Prettier e LF padronizados.

O compilador ignora checagem interna de declarações de terceiros (`skipLibCheck`), mas checa nosso código e consumo de tipos em modo strict. Não é justificativa para `any` no código próprio.

## Ambientes

`config/environments.json` registra development local exclusivamente emulado e staging/production não provisionados. Não existe `.firebaserc`, projeto real, conta de serviço ou pipeline de deploy. Config mobile rejeita build de staging/production até autorização e configuração próprias.

O `.env.example` contém apenas configuração fictícia. Variáveis EXPO_PUBLIC entram no bundle e são públicas. Credenciais reais nunca devem estar no repositório ou mobile. Dev/staging/production deverão ser projetos separados no futuro.

## Testes de autorização

`npm run test:rules` inicia somente Firestore/Storage localmente e encerra ao terminar. `test:rules:inside` não pode ser executado sozinho sem variáveis exatas dos emuladores. O bypass para semear fixtures é exclusivo de `tests/rules` e não altera as regras versionadas.

Testes cobrem anônimo, dono, outro usuário, moderador/admin com claims; listagens, leitura, criação, update/delete, lotes, listeners, contagens, collection groups e operações Storage. `assertFails` exige erro de permissão, não qualquer exceção. Controle privilegiado comprova existência e disponibilidade dos fixtures.

Testes de contrato mantêm allowlist independente e verificação estrutural pelo TypeScript. Tipos privados não são reexportados. Schema runtime rejeita extras e objetos embutidos. Não implementa geração de referência, busca/perfil ou autorização de backend.

O scanner examina arquivos versionados e candidatos não ignorados, inclusive arquivo sensível forçado no Git. Não imprime o conteúdo suspeito. Não substitui ferramenta de DLP, avaliação de histórico ou rotação em caso de vazamento.

## CI

GitHub Actions usa ações fixadas por SHA, permissão somente leitura, sem persistência de credencial Git, npm ci, Node fixado, Java 21, projeto demo e dados artificiais. Executa formato, lint, tipos, contratos, emuladores, builds, scanner, auditoria de dependências e compatibilidade Expo. Não usa secrets de infraestrutura nem faz deploy.

## Git

Branch principal main; mudanças seguintes em codex/<objetivo>. Commits pequenos para documentação, workspace, Rules, testes e CI. Não comitar node_modules, outputs, logs, caches ou segredos. Atualizações de dependências exigem revisar lockfile, audit e compatibilidade Expo. Não usar audit fix --force automaticamente.

## Limites da evidência

Emuladores não validam IAM, App Check real, quotas, bucket ACL, MFA, push ou comportamento nativo. Export Android/iOS valida bundling, não instalação em dispositivo. Operação pública e recursos futuros exigem testes correspondentes e nova autorização. Não usar dados reais nem avançar para etapa 2 nesta entrega.

## Correções transitivas e caches

Ver [ADR 0007](decisions/0007-restricted-local-toolchain.md) antes de ampliar o uso do Firebase CLI: pipelines JSON não necessárias aos emuladores falham explicitamente. Testes de compatibilidade cobrem as dependências atualizadas. Nenhum advisory é ignorado pelo CI.

Npm usa `.cache/npm` no projeto; o executor de emuladores usa `.cache/firebase`, `.cache/config` e `.cache/tmp`. Esses diretórios são ignorados pelo Git. Nesta máquina o usuário escolheu `D:\EncontrodeTorcedor` após o disco C: ficar sem espaço; o código e o lockfile continuam portáveis e não incluem esse caminho local.
