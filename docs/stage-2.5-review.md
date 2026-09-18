# Revisão da Etapa 2.5 — Domínio do Torcedor

Estado: implementação local concluída em codex/fan-domain-model; aguardando checkpoint completo antes de publicação.

## Entregue

Contratos estritos e genéricos para Club, Idol, FanProfile, FanClubPreference, ConnectionPreference, ConnectionIntent e LifestyleProfile. IDs canônicos, aliases normalizados, estados editoriais, integridade referencial e separação entre conta, identidade civil, domínio do torcedor e futura projeção pública.

Documentação do modelo e inventário de entradas futuras do motor. Nenhum endpoint, banco, tela, catálogo real, descoberta, score, foto, interação ou analytics foi criado.

## Decisões

- Plataforma multiclube; nenhuma entidade específica do clube piloto.
- Clubes e ídolos são entidades canônicas; texto livre não é fonte de verdade.
- Alias ambíguo invalida o catálogo.
- Apenas entidades ativas podem ser escolhidas.
- Rivalidade e simpatia são autodeclaradas.
- Lifestyle é opcional e minimizado.
- Fixtures inteiramente fictícias.
- CPF, UID, nascimento, contato e estado administrativo são recusados pelo perfil.

## Testes de domínio

10 testes focados aprovados na criação inicial: clube inválido, ídolo desconhecido/indisponível, alias canônico, status inválido, colisão de alias, referências fora do catálogo, consistência de estádio, campos privados, separação da conta e allowlist do agregado.

Checkpoint completo aprovado: formato, lint, TypeScript strict e builds passaram. Foram aprovados 378 testes: 142 unitários, 211 de Rules e 25 de integração. O scanner examinou 95 arquivos sem ocorrências e a auditoria encontrou 0 vulnerabilidades. O encerramento do emulador de Storage repetiu o aviso interno já documentado após todos os testes passarem e o comando retornou código 0.

## Arquivos criados

- packages/contracts/src/fan-catalog.ts
- packages/contracts/src/fan-domain.ts
- packages/contracts/tests/fan-domain.test.ts
- docs/FAN_DOMAIN_MODEL.md
- docs/MATCH_ENGINE_INPUTS.md
- docs/decisions/0010-canonical-fan-domain-catalogs.md
- docs/stage-2.5-review.md

## Arquivos alterados

- packages/contracts/src/index.ts
- docs/PROJECT_STATE.md

## Pendente e riscos

Governança e catálogo reais, trilha de auditoria editorial, visibilidade pública, retenção/correção/exclusão, taxonomias de interesses e avaliação de sensibilidade. retired exige semântica editorial final. Os contratos não provam autorização nem implementam persistência.
