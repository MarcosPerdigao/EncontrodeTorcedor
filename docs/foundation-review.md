# Revisão das etapas 0 e 1

Data: 16/09/2026. Diretório de trabalho autorizado: `D:\EncontrodeTorcedor`. A cópia original em C: foi preservada. Branch: `codex/secure-foundation`.

## Escopo entregue

Documentação de produto, arquitetura, dados, autorização, ameaças, retenção e sete ADRs; workspace Expo/React Native com TypeScript strict; base vazia de Cloud Functions; contratos separados; Firestore e Storage integralmente fechados; testes, emuladores e CI. Nenhuma funcionalidade da etapa 2 foi implementada e nenhum recurso de nuvem foi provisionado.

Jogos e localização precisa seguem fora do MVP. A retenção de mensagens continua pendente: 180 dias é hipótese, sem TTL ou configuração de negócio. EXPO_PUBLIC é público. Somente fixtures artificiais são utilizadas.

## Validação local

`npm run check` terminou com código 0 na rodada final, executando os controles abaixo em sequência.

| Verificação                             | Resultado                                          |
| --------------------------------------- | -------------------------------------------------- |
| Prettier (`format:check`)               | Aprovado                                           |
| ESLint (`lint --max-warnings 0`)        | Aprovado, sem avisos                               |
| TypeScript strict (`typecheck`)         | Aprovado nos testes, mobile, contracts e functions |
| Testes unitários/contratos/ferramentas  | 65/65 aprovados, 5 arquivos                        |
| Testes Firestore/Storage nos emuladores | 191/191 aprovados, nenhum ignorado                 |
| Total                                   | 256/256 testes aprovados                           |
| Build contracts + functions             | Aprovado                                           |
| Scanner de secrets                      | 64 arquivos; 0 ocorrências                         |
| npm audit, toda a árvore                | 0 vulnerabilidades conhecidas                      |
| Instalação limpa (`npm ci`)             | Aprovada; 1.312 pacotes instalados                 |
| Compatibilidade Expo                    | Dependencies are up to date                        |
| Exportação Android/iOS                  | Ambos os bundles gerados                           |
| `git diff --check`                      | Sem problemas                                      |

A revisão manual confirmou os dois wildcards exclusivamente negativos, sem exceções para autenticação, claims ou signals. A execução final dos testes de regras durou 26,19 segundos; a suíte unitária, 2,40 segundos. Tempos variam com cache e disco.

A instalação limpa com `npm ci` foi concluída. A exportação Expo gerou um bundle Android e um iOS; `npx expo install --check` confirmou compatibilidade. Isso não representa compilação nativa, instalação em dispositivo ou teste de interface. A aplicação permanece deliberadamente vazia.

O workflow executa instalação limpa, formato, lint, tipos, testes, build, scanner, auditoria e exportação mobile. O CI remoto não foi executado: não houve push ou deploy.

## Revisão adversarial

Pergunta: se um atacante controlar totalmente o aplicativo cliente, consegue obter ou alterar dados diretamente?

Pelas regras versionadas, todas as operações cliente são negadas independentemente de identidade, caminho, propriedade ou claims. A revisão não encontrou caminho autorizado de acesso direto. Não há endpoint alternativo, SDK Firebase no mobile ou credencial administrativa no código entregue.

Os testes exercitam cinco atores: anônimo, dono, outro usuário, moderador e administrador. Cobrem listagens de 22 collections, documentos próprios/alheios, caminhos desconhecidos e aninhados, criação, atualização, exclusão, lotes, contagem, collection groups e listener de signals. No Storage cobrem listagem, bytes, metadata, URL de download, upload novo/sobrescrita, alteração e exclusão. Um controle privilegiado comprova a existência dos dados e objetos sintéticos. As negações precisam ser erros de permissão, não falhas genéricas de conexão.

O DTO possui allowlist independente no teste estrutural e schema runtime estrito. Campos extras, privados e objetos escondidos em listas são rejeitados. Referências opacas não constituem autorização nem comprovam aleatoriedade; geração e resolução no backend são trabalho futuro. Texto livre não garante ausência de informações voluntariamente inseridas por uma pessoa.

Limite da conclusão: regras não controlam Admin SDK/IAM nem os canais administrativos dos emuladores. Estes são locais, vinculados a loopback e contêm somente fixtures artificiais. Não existe ambiente real cuja configuração de IAM, bucket, App Check ou provedores possa ser certificada nesta entrega. O scanner identifica padrões conhecidos e nomes proibidos; não prova ausência absoluta de segredos.

O runtime Storage 1.1.3 emitiu NullPointerException ao encerrar sua entrada padrão, depois de os 191 testes passarem e o comando terminar com código 0. No Windows também houve processo Firestore residual, identificado pelo caminho deste projeto e encerrado explicitamente. Isso é uma limitação observada do ciclo de encerramento das ferramentas locais, não uma negação de autorização considerada válida. Não expor emuladores; verificar processos/portas após interrupções.

## Decisões e correções

A arquitetura de produto foi preservada. O [ADR 0007](decisions/0007-restricted-local-toolchain.md) registra uma restrição operacional adicional: dependências transitivas corrigidas e substituição do parser JSON vulnerável do Firebase CLI por módulo local que sempre recusa seu uso. Apenas os comandos de emulador documentados são suportados nesta instalação do CLI. Importações JSON e pipelines de Next Hosting ficam indisponíveis; não há supressão de advisories. Reavaliar antes de ampliar o uso da ferramenta.

Foram corrigidos o reconhecimento de CommonJS pelo lint e o limite de execução dos testes de carregamento das ferramentas, elevado de 5 para 30 segundos diante da latência do disco local. A preparação das fixtures passou a permitir 120 segundos para inicialização fria do runtime Java; os 191 testes concluíram na repetição. Nenhuma regra ou asserção de segurança foi relaxada. Avisos de depreciação transitivos são dívida de manutenção e não equivalem a vulnerabilidade confirmada.

A documentação foi revisada em conjunto: perfil exibível não significa banco público; signals permanece fechado; controles futuros não são apresentados como implementados; tipos privados não autorizam coleta; localização precisa não integra o modelo; produção e etapa 2 permanecem fora do escopo.

## Inventário completo

A árvore abaixo lista todos os arquivos de código, documentação e configuração criados. Dependências, caches, logs, artefatos gerados e metadados Git são excluídos do versionamento.

```text
D:\EncontrodeTorcedor\
  .editorconfig
  .env.example
  .gitattributes
  .github/
    workflows/
      ci.yml
  .gitignore
  .npmrc
  .nvmrc
  .prettierignore
  .prettierrc.json
  apps/
    mobile/
      app.config.ts
      index.ts
      package.json
      src/
        App.tsx
      tsconfig.json
  config/
    environments.json
  docs/
    architecture.md
    authorization.md
    data-model.md
    decisions/
      0001-firebase-initial-infrastructure.md
      0002-server-mediated-data-access.md
      0003-no-precise-location-in-mvp.md
      0004-opaque-public-references.md
      0005-deny-by-default.md
      0006-private-and-displayable-data.md
      0007-restricted-local-toolchain.md
    development.md
    foundation-review.md
    product.md
    retention.md
    security-principles.md
    threat-model.md
  eslint.config.mjs
  firebase.json
  firebase/
    firestore.indexes.json
    firestore.rules
    storage.rules
  functions/
    package.json
    src/
      index.ts
    tsconfig.json
  package-lock.json
  package.json
  packages/
    contracts/
      package.json
      src/
        index.ts
        public-profile.ts
        server/
          private-user-data.ts
      tests/
        public-profile.test.ts
      tsconfig.json
  README.md
  scripts/
    run-emulators.mjs
    scan-secrets.mjs
    secret-patterns.d.mts
    secret-patterns.mjs
  tests/
    foundation/
      emulator-guard.test.ts
      secret-scanner.test.ts
      security-policy.test.ts
      toolchain-security.test.ts
    rules/
      deny-all.test.ts
  tools/
    disabled-json-import/
      disabled.cjs
      package.json
      README.md
  tsconfig.base.json
  tsconfig.json
  vitest.config.ts
  vitest.rules.config.ts
```

Total: 64 arquivos.

## Encerramento

Após as verificações, a entrega se encerra nas etapas 0 e 1. Autenticação, onboarding, perfil funcional, descoberta, likes, match, chat e jogos exigem nova autorização.
