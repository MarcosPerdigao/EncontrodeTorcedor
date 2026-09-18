# Revisão da Etapa 4.5 — Descoberta e Card de Perfil

Estado: implementação concluída e publicada em codex/discovery-card; CI remoto aprovado; aguardando revisão.

Base aprovada: Etapa 4 em 38f8707, incluindo correção de compatibilidade Expo validada pelo CI remoto.

## Resultado

DiscoveryCard foi implementado como projeção estrita e reduzida de um PublicProfileDTO já autorizado. DiscoveryFilters descreve filtros declarativos e DiscoveryCardPresentation controla somente remoção ou limitação de campos. Não existe endpoint, geração de candidatos, paginação funcional, algoritmo, score, ranking, recomendação, machine learning, swipe, like, match ou chat.

## Regras de exposição

- PublicProfileDTO é a única fonte do card;
- até três fotos públicas, ordenadas pelo campo público `order`;
- até dois nomes públicos de ídolos;
- experiência de estádio é omitida do card;
- bio, lifestyle e intenções dependem da regra de apresentação;
- selo nunca é criado pela apresentação: somente propagado quando já existe no PublicProfileDTO;
- lifestyle é reduzido a duas preferências musicais e três hobbies;
- campos desconhecidos ou privados fazem a projeção falhar fechada.

## Filtros

O contrato aceita somente faixa etária adulta válida, até dez cidades canônicas, até dez clubes canônicos, intenções de conexão sem duplicatas e preferência `any` ou `verified_only`. Não aceita coordenadas, raio, distância, geohash, score, rank, sortBy, algoritmo, trustLevel ou UID.

Filtros não concedem audiência, não removem bloqueios e não definem ordenação. A aplicação a candidatos continua fora do escopo.

## Arquivos criados

- docs/DISCOVERY_CARD_MODEL.md
- docs/stage-4.5-review.md
- packages/contracts/src/discovery-card.ts
- packages/contracts/tests/discovery-card.test.ts
- functions/src/domain/discovery-card-projection.ts
- tests/unit/discovery-card-projection.test.ts

## Arquivos alterados

- packages/contracts/src/index.ts
- packages/contracts/src/public-profile.ts
- docs/PROJECT_STATE.md
- docs/PUBLIC_PROFILE_MODEL.md
- docs/DISCOVERY_AUDIENCE_RULES.md
- docs/architecture.md
- docs/authorization.md
- docs/data-model.md
- docs/security-principles.md
- docs/threat-model.md

PublicProfile não mudou semanticamente. Apenas os schemas existentes de referência opaca e nome público canônico passaram a ser exportados para o novo contrato reutilizar exatamente as mesmas validações, evitando regex e regras divergentes.

## Testes locais

Os 45 testes focados de card, filtros e projeção passaram. O checkpoint completo `npm run check` terminou com código 0: 258 testes unitários, 211 testes de Rules e 27 testes de integração, totalizando 496. Formato, lint, TypeScript strict, builds, scanner de 121 arquivos sem ocorrências e auditoria sem vulnerabilidades foram aprovados.

A instalação limpa `npm ci` instalou 1.346 pacotes e terminou sem vulnerabilidades. A compatibilidade Expo e as exportações Android/iOS passaram sobre a instalação limpa.

## CI remoto da Etapa 4

A primeira execução remota 35357728151 aprovou o bloco principal e falhou somente porque o catálogo Expo passou a exigir 57.0.24 enquanto a branch usava 57.0.23. A correção mínima foi publicada em 38f8707. A execução 35382987930 passou integralmente, incluindo `npm ci`, checkpoint, compatibilidade Expo e exportações Android/iOS.

O CI remoto da Etapa 4.5 [35383947519](https://github.com/MarcosPerdigao/EncontrodeTorcedor/actions/runs/35383947519) foi aprovado em 2min05s. Passaram instalação reproduzível, scanner, formato, lint, TypeScript strict, 496 testes, builds, auditoria, compatibilidade Expo e exportações Android/iOS.

## Divergências encontradas

- O lint inicial encontrou dois imports de teste não usados; eles foram removidos e incorporados ao commit de testes antes da publicação.
- A primeira tentativa do checkpoint completo da Etapa 4.5 encontrou a porta 8080 ocupada pelo Firestore Emulator deste projeto, PID 3868, deixado pela validação anterior. O processo foi identificado pelo command line, encerrado e o checkpoint repetido integralmente com sucesso.
- O runtime de Rules ainda emite a NPE conhecida ao encerrar, depois dos testes aprovados e sem alterar o código de saída.
- A instalação limpa local levou 12 minutos por reconstrução e I/O, mas permaneceu ativa e terminou normalmente; não havia lock.

## Riscos residuais

- Não existe endpoint nem paginação opaca para entregar cards.
- A aplicação dos filtros a um universo de candidatos não foi implementada.
- Cache, expiração, revogação de mídia e autorização repetida para perfil completo continuam pendentes.
- Regras de apresentação são autoridade do servidor em uma integração futura; aceitar esse objeto do mobile ampliaria exposição indevidamente.
- A preferência `verified_only` não substitui a fronteira de audiência nem transforma selo em garantia pessoal.

Etapa 4.5 concluída e publicada. Parar e aguardar revisão.
