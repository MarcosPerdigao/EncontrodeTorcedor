# Revisão da Etapa 2

Estado: implementação, validação local e CI remoto concluídos. Base aprovada: eff5825, CI remoto da etapa 1.5 aprovado. Branch: codex/stage-2-auth-identity.

## Escopo

Autenticação local Firebase, sessão própria, estado da conta, elegibilidade por calendário, abstração de identidade e autorização inicial. Firestore/Storage continuam deny-all. Sem CPF, perfil completo, fotos, clubes/ídolos reais, descoberta, ranking, interações ou chat.

## Decisões

Ver [ADR 0008](decisions/0008-local-authentication-and-session-boundary.md). E-mail/senha e memória volátil; SDK JS Auth em vez de integração nativa antecipada. Sem projeto Firebase real. Runtime não emulado recusado. Adulto declarado permanece em revisão; não é identidade/idade comprovada. Calendário UTC com 29/02 em 01/03 nos anos não bissextos.

## Endpoints

POST /session/bootstrap: autentica, cria conta pendente de forma transacional e entrega estado mínimo + credencial opaca de sessão.
POST /session/state: estado próprio autorizado, com sessão/versão vigente.
POST /account/complete: registra nascimento privado uma vez, e-mail verificado e chave idempotente.
POST /session/revoke: revoga sessões lógicas, exige login recente e impõe nova autenticação.
Não há operações administrativas, de terceiros, exclusão funcional ou listagens.

## Persistência

accounts/{hashDoUid}: referência opaca, estados explícitos, emailVerificationStatus, identityVerificationStatus, sessionVersion, authValidAfter e timestamps.
identities/{hashDoUid}: nascimento e timestamp privado.
Subcollections de accounts: sessions (hash de credencial, versão, authTime, expiração), authSessions (linhagem de autenticação), rateLimits (janela/contador por operação), operations (recibo de conclusão).
UID só é usado internamente após verificação do token. Nenhum documento é retornado diretamente.

## Evidência da implementação

## Resultados locais

Checkpoint em 17/09/2026:

| Controle                                  | Resultado                              |
| ----------------------------------------- | -------------------------------------- |
| npm run check                             | Código 0                               |
| Formato, lint e TypeScript strict         | Aprovados                              |
| Unitários, contratos e ferramentas        | 132/132, oito arquivos                 |
| Firestore/Storage Rules                   | 211/211, nenhum ignorado               |
| Integração Auth/Functions/Firestore e SDK | 25/25, dois arquivos                   |
| Total                                     | 368 testes aprovados                   |
| Build contracts/functions                 | Aprovado                               |
| Exportação Android/iOS                    | Ambos gerados, não é instalação nativa |
| Expo compatibility                        | Dependencies are up to date            |
| Scanner                                   | 88 arquivos, 0 ocorrências             |
| npm audit                                 | 0 vulnerabilidades conhecidas          |
| git diff --check                          | Aprovado                               |

CI remoto da Etapa 2: aprovado em 18/09/2026. Execução [35301636217](https://github.com/MarcosPerdigao/EncontrodeTorcedor/actions/runs/35301636217), job `verify` concluído em 1min52s. Passaram checkout sem credenciais persistidas, scanner pré-instalação, `npm ci`, checkpoint completo, compatibilidade Expo e exportação Android/iOS. Não houve deploy, merge ou criação de ambiente Firebase real.

O GitHub anotou que as versões fixadas de checkout/setup-node/setup-java ainda miram o runtime Node 20 das actions, atualmente executado forçadamente em Node 24, e que `ubuntu-latest` migrará para Ubuntu 26 a partir de 19/10/2026. São riscos de manutenção do CI; não são falhas dos testes. Atualizar SHAs somente após revisão das versões oficiais e repetir toda a matriz.

## Revisão adversarial

Pergunta: se um atacante controla completamente o aplicativo cliente, consegue ler, alterar ou forjar estado de identidade, elegibilidade, sessão ou conta?

Não foi encontrado caminho pela API implementada ou pelas Rules para ler outro titular, atribuir estados privilegiados ou publicar dados privados. Identidade deriva do Firebase Admin verifyIdToken com checagem de revogação e estado Auth atual. UID no payload é rejeitado, não usado. Conta e versão são relidas transacionalmente; claims administrativas e tokens ainda válidos não contornam suspensão, banimento ou inelegibilidade. Sessão roubada sem ID token correspondente não basta; sessão/version antigas e credencial expirada são recusadas.

Nascimento é declarado pelo titular, não comprovado: atacante pode mentir sobre ele, mas não pode transformar isso em elegibilidade confirmada, identidade verificada ou conta ativa. Adultos declarados ficam review_required. Menor fica ineligible e não pode trocar data para contornar. Não existe endpoint de ativação, moderação ou aprovação de identidade; provedor não configurado falha explicitamente.

DTO possui seis campos em allowlist, testes de tipo/JSON e rejeição de extras. Campos privados nunca são copiados por spread de documento. Firebase Auth necessariamente fornece ao próprio titular seu token/identidade de autenticação; a proibição de UID/dados privados é aplicada às respostas da nossa API, sem pretender modificar o protocolo Firebase. Bootstrap retorna uma credencial opaca de sessão separada do DTO, tratada como secreta do titular e não persistida em claro.

Contadores de tentativas autenticadas são confirmados independentemente da mutação: recusa não desfaz limite. Testes cobrem essa condição, janela, idempotência, nascimento inválido sem gravação parcial, acesso cruzado, claims, datas limítrofes, ano bissexto e logs. Runtime de aplicação falha fora do demo emulado.

Limite essencial: emuladores aceitam canais administrativos/tokens artificiais e não são fronteira de segurança contra um invasor com acesso local. Não expor à rede; usar somente fixtures. Não há ambiente real cuja assinatura criptográfica, IAM, App Check, proteção de abuso ou enumeração tenha sido validada. Credencial administrativa comprometida também está fora das Rules.

## Divergências, correções e riscos residuais

- SDK JavaScript App/Auth em memória foi escolhido para execução local; integração nativa/persistência segura e App Check real ficam para decisão de ambiente real.
- Nenhum projeto Firebase real configurado. A implementação deliberadamente recusa esse runtime; não é uma entrega pronta para produção.
- Cadastro do Auth pode revelar EMAIL_EXISTS; teste registra a limitação. Mensagem genérica no app não é apresentada como solução. Controles do provedor/edge precisam de revisão e testes reais antes do lançamento.
- Limites atuais são por ator autenticado/operação; não mitigam criação abusiva de identidades no provedor ou DoS sem autenticação. Não há contador global.
- Nascimento imutável e ausência de aferição real exigem processo posterior de correção/revisão. Política de 29/02 conservadora deve ser validada. Exclusão completa e reautenticação orientada na UI não foram antecipadas; revogação exige login de até cinco minutos e saída local continua possível se a revogação falhar.
- Sessões expiram para autorização em uma hora; limpeza física dos metadados persistidos não existe em nuvem, pois só há emuladores. Retenção operacional deve preceder ambiente real; prazo de mensagens não foi decidido.
- A descoberta das Functions precisou de timeout local de 120s para disco frio. O runtime Storage mantém aviso conhecido ao encerrar depois do sucesso; testes não foram ignorados. Processos residuais do próprio emulador são encerrados após validação.
- O CI atual usa `ubuntu-latest`; a imagem mudará no futuro, e actions fixadas por SHA precisam migrar do runtime Node 20. O resultado aprovado vale para a execução identificada acima.
- Export mobile valida bundles; nenhuma instalação em Android/iOS físico foi realizada.
- Apenas dados sintéticos. Logs do Auth Emulator contêm links de ação para essas fixtures; ficam fora do Git. Logger de aplicação não inclui dados privados.

## Itens não implementados e aprovações pendentes

Perfil público completo, fotos, catálogos reais, descoberta, compatibilidade funcional, likes, matches, chat, Passaporte, Dia de Jogo, gamificação e etapa 3. Também pendentes provedor de identidade, aferição definitiva de idade, OAuth Google/Apple, ambiente real/App Check, exclusão/correção, retenção, regras administrativas do GitHub e políticas de lançamento.

## Inventário

Arquivos criados:

- apps/mobile/src/auth.ts
- functions/src/domain/account.ts
- functions/src/domain/identity-provider.ts
- functions/src/http.ts
- functions/src/platform/auth.ts
- functions/src/platform/local.ts
- functions/src/platform/logger.ts
- functions/src/platform/store.ts
- functions/src/service.ts
- packages/contracts/src/session.ts
- packages/contracts/tests/session.test.ts
- tests/integration/auth-account.test.ts
- tests/integration/auth-sdk.test.ts
- tests/unit/account.test.ts
- tests/unit/session-service.test.ts
- vitest.integration.config.ts
- docs/decisions/0008-local-authentication-and-session-boundary.md
- docs/stage-2-review.md

Arquivos alterados:

- README.md
- apps/mobile/app.config.ts
- apps/mobile/package.json
- apps/mobile/src/App.tsx
- docs/PROJECT_STATE.md
- docs/ROADMAP.md
- docs/architecture.md
- docs/authorization.md
- docs/data-model.md
- docs/development.md
- docs/product.md
- docs/security-principles.md
- docs/threat-model.md
- eslint.config.mjs
- firebase.json
- functions/package.json
- functions/src/index.ts
- package-lock.json
- package.json
- packages/contracts/src/index.ts
- scripts/run-emulators.mjs
- tests/foundation/security-policy.test.ts
- tests/rules/deny-all.test.ts
- vitest.config.ts

## Commits publicados

- `09dc2ca` — feat: add account identity models and privacy contracts
- `aa96138` — feat: add authenticated session bootstrap and account API
- `9e991d3` — feat: add local email authentication and account access
- `0b4138b` — test: enforce authentication and account security in emulator CI
- `e2616b0` — docs: record stage 2 verification and operational limits

## Encerramento

Etapa 2 concluída na branch e aprovada pelo CI remoto. Parar para revisão. Nenhum merge em main, deploy, ambiente real ou etapa posterior está autorizado por esta entrega.
