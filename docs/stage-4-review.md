# Revisão da Etapa 4 — Descoberta Segura e Regras de Audiência

Estado: concluída e aprovada; publicação autorizada em codex/discovery-safety-boundary e usada como base da Etapa 4.5.

## Resultado

Foi criada uma fronteira pura de servidor que deriva TrustLevel, decide participação, aplica bloqueio bidirecional, separa visualização de interação e exige uma cota diária finita. Não existe endpoint, consulta de candidatos, card, swipe, like, match, ranking, recomendação ou chat.

## Política implementada

- verified pode visualizar basic;
- basic pode visualizar verified;
- verified pode visualizar verified;
- basic→basic permanece pendente e falha fechado;
- restricted, suspended e banned não participam;
- ausência de perfil público, inelegibilidade ou restrição de segurança retiram a conta da audiência;
- qualquer bloqueio impede exposição nas duas direções;
- uma preferência futura pode exigir verified para iniciar interação, sem impedir a visualização permitida;
- toda permissão de interação exige cota restante; verified não possui acesso ilimitado.

Basic não é comunicado como suspeito ou inseguro. Verified significa somente que uma etapa adicional de verificação foi concluída.

## Arquivos criados

- docs/DISCOVERY_AUDIENCE_RULES.md
- docs/decisions/0012-trust-and-discovery-boundary.md
- docs/stage-4-review.md
- packages/contracts/src/trust.ts
- packages/contracts/src/discovery.ts
- packages/contracts/tests/discovery.test.ts
- functions/src/domain/discovery-eligibility.ts
- tests/unit/discovery-eligibility.test.ts

## Arquivos alterados

- packages/contracts/src/index.ts
- packages/contracts/src/session.ts
- docs/PROJECT_STATE.md
- docs/architecture.md
- docs/authorization.md
- docs/data-model.md
- docs/security-principles.md
- docs/threat-model.md
- docs/stage-3.5-review.md

## Contratos

TrustLevel contém basic, verified, restricted, suspended e banned. TrustContext, AudienceRule, DiscoveryEligibility e InteractionPermission são estritos. Resultados permitidos e negados possuem invariantes coerentes; interação permitida exige saldo positivo.

Os contratos de autoridade são para construção pelo servidor. Nenhum comando ou configuração editável do mobile ganhou trustLevel, bloqueio, status, cota ou preferência do alvo.

## Privacidade

A avaliação recebe somente estados mínimos e devolve decisão genérica. Não inclui CPF, UID, accountRef, nascimento, contato, token, localização, detalhes de denúncia, perfil ou estado administrativo. Estado indisponível não revela se o alvo foi suspenso, banido, restringido ou ficou sem perfil.

## Testes

O checkpoint completo `npm run check` terminou com código 0: 213 testes unitários, 211 testes de Rules e 27 testes de integração, totalizando 451. Os 24 testes focados em contratos e audiência passaram. Formato, lint, TypeScript strict e builds foram aprovados. A compatibilidade Expo e as exportações Android/iOS também passaram. O scanner final examinou 115 arquivos versionados/candidatos sem ocorrências e a auditoria encontrou 0 vulnerabilidades.

O runtime de Rules emitiu o aviso conhecido ao encerrar, depois da aprovação dos testes, sem alterar o código de saída. Nenhum ambiente Firebase real foi criado e nenhum deploy foi realizado.

## Divergências e decisões pendentes

- A política basic→basic não foi aprovada; a fronteira nega por padrão com `policy_pending`.
- Valores reais das cotas e combinação de limites por conta, dispositivo e rede ainda dependem de análise operacional.
- O efeito de denúncias usa somente uma restrição já derivada; workflow, recurso e detalhes de moderação não foram implementados.
- Paginação, diversidade, auditoria, App Check e antifraude continuam documentados, sem implementação.
- SessionDTO continua expondo apenas basic ou verified ao próprio titular; estados bloqueantes permanecem autoridade interna da fronteira.

## Riscos residuais

- A função ainda depende de fontes futuras confiáveis para bloqueios, restrições e consumo de cota.
- Não existe armazenamento transacional que impeça corrida no consumo de limites.
- Uma razão genérica reduz inferência, mas tempos de resposta e padrões de resultados ainda precisarão de testes contra enumeração.
- Verificação pode ser interpretada incorretamente como garantia pessoal; texto de produto precisa preservar a decisão do ADR 0012.
- Descoberta real exige paginação opaca, exposição gradual, bloqueio antes da projeção e testes de abuso.

Etapa 4 concluída e aprovada.
