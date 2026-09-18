# Revisão da Etapa 3 — Onboarding e Perfil de Torcedor

Estado: concluída e aprovada; usada como base da Etapa 3.5.

## Resultado

Uma conta autenticada, com e-mail confirmado e declaração adulta em revisão, pode criar um perfil básico sem verificação de identidade. identityVerificationStatus permanece not_started e trustLevel basic é derivado pelo servidor. Verificação posterior muda apenas o nível de confiança; o agregado do torcedor permanece idêntico.

O fluxo mobile apresenta propósito e segurança, clube canônico obrigatório, intensidade, ídolo canônico opcional, estádio opcional, múltiplas intenções, abertura entre torcidas, poucos interesses opcionais e revisão de privacidade. A mensagem adotada é “A verificação ajuda a manter a comunidade segura.”

## Segurança e privacidade

- Identidade vem do token e da sessão; UID no payload é recusado.
- CPF não existe em cadastro, contratos, mobile, fixtures, logs ou modelo.
- Comando recusa nascimento, contato, trustLevel e estados administrativos.
- Conta suspensa, banida, inelegível ou em exclusão continua bloqueada.
- Firestore e Storage permanecem fechados ao cliente.
- Perfil fica separado de Account e Identity em caminho interno derivado.
- Resposta não contém UID, nascimento, CPF, telefone ou localização precisa.
- Catálogo runtime contém somente entidades fictícias e ambiente local.
- Nenhum ambiente Firebase real, deploy ou configuração de produção foi criado.

## Arquivos criados

- apps/mobile/src/FanOnboarding.tsx
- functions/src/domain/local-fan-catalog.ts
- packages/contracts/src/onboarding.ts
- packages/contracts/tests/onboarding.test.ts
- docs/decisions/0009-progressive-identity-verification.md
- docs/stage-3-review.md

## Arquivos alterados

- apps/mobile/src/App.tsx
- apps/mobile/src/auth.ts
- functions/src/domain/account.ts
- functions/src/http.ts
- functions/src/index.ts
- functions/src/platform/logger.ts
- functions/src/service.ts
- packages/contracts/src/index.ts
- packages/contracts/src/session.ts
- packages/contracts/tests/fan-domain.test.ts
- packages/contracts/tests/session.test.ts
- tests/integration/auth-account.test.ts
- tests/unit/account.test.ts
- tests/unit/session-service.test.ts
- docs/PROJECT_STATE.md
- docs/architecture.md
- docs/authorization.md
- docs/data-model.md
- docs/development.md
- docs/product.md
- docs/PROFILE_MODEL.md
- docs/security-principles.md
- docs/threat-model.md
- docs/stage-2.5-review.md

## Modelos e operações

SessionDTO ganhou trustLevel e estados fan_profile_required/access_unavailable. CreateFanProfileCommand não contém referência do perfil nem autoridade administrativa. FanProfileResponse devolve sessão e o agregado privado do titular. A API local ganhou POST /fan-profile/create, criação única, idempotência, limite por ator e validação contra catálogo ativo.

## Testes

Checkpoint final aprovado com código zero: formato, lint, TypeScript strict, builds e 397 testes — 159 unitários, 211 de Rules e 27 de integração. A integração real nos emuladores cobriu conta básica, catálogo inválido, tentativa de elevar verificação, separação de dados e mudança posterior de trustLevel.

O scanner examinou 101 arquivos versionados/candidatos sem ocorrências; npm audit encontrou 0 vulnerabilidades. A compatibilidade Expo está atualizada e as exportações Android/iOS passaram após a correção textual final. Busca no código de runtime confirmou ausência de CPF em apps/mobile, functions/src e packages/contracts/src. O aviso interno do runtime de Rules ocorreu somente no encerramento, depois dos testes aprovados, com código final zero.

## Decisões pendentes e riscos

- Capacidades exatas dos níveis basic e verified além da criação do perfil.
- Provedor real, prova mínima, retenção e contestação da verificação.
- Catálogo real, licenciamento e governança editorial.
- Edição, exclusão, retenção e projeção pública do perfil.
- Antifraude, App Check, bloqueio, denúncia e moderação antes de descoberta.
- Taxonomias e audiência de música, hobbies e estilo de vida.
- Testes em dispositivo físico e acessibilidade assistiva.
- Aviso interno do runtime de Rules no encerramento e possível processo Java órfão.

## Fora do escopo

Nenhum upload de foto, moderação automática, descoberta, swipe, like, match, chat, algoritmo, analytics, notificação, gamificação, catálogo real ou ambiente de produção foi implementado.
