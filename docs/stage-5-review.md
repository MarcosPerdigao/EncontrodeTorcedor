# Revisão da Etapa 5 — Motor de Afinidade e Compatibilidade

Estado: implementação local concluída na branch `codex/affinity-engine`; aguardando revisão e autorização separada para publicação.

Base aprovada: Etapa 4.5 em `a899c95`.

## Resultado

A etapa implementa uma explicação determinística de elementos públicos em comum entre duas pessoas que já passaram pela audiência. O motor não encontra candidatos, não decide quem pode aparecer, não ordena pessoas e não prevê relacionamento.

`DiscoveryEligibility` continua sendo a fronteira anterior e obrigatória para bloqueios, suspensão, banimento, restrição e regras de audiência. O motor aceita somente `canView: true` com motivo `eligible`; qualquer outra decisão encerra a operação com erro genérico.

## Entradas autorizadas

`AffinityContext` é derivado no servidor de dois `PublicProfileDTO` já autorizados e contém somente:

- clube canônico, ídolos canônicos, intensidade e presença de experiência ampla de estádio;
- hobbies, música, estilo de vida e relação com pets já públicos;
- intenções de conexão já públicas.

Nome, idade, cidade, bio e fotos ficam fora porque não são necessários às regras V1. Account, Identity, FanProfile persistido, CPF, UID, accountRef, nascimento, contatos, localização precisa, atributos sensíveis, mensagens, denúncias e estado administrativo são excluídos ou recusados pelos schemas estritos.

## Regras V1

Cada coincidência produz `kind`, `sharedValue` e uma frase explicativa. A ordem fixa serve apenas à apresentação e aos testes.

1. mesmo clube;
2. mesmo ídolo;
3. mesma intensidade de torcida;
4. interesse amplo em estádio de ambos;
5. hobby compartilhado;
6. preferência musical compartilhada;
7. mesmo estilo de vida;
8. mesma relação positiva com pets;
9. intenção de conexão compartilhada.

Exemplos de saída: “Vocês torcem para Clube Horizonte.”, “Vocês gostam do ídolo Alex da Serra.” e “Vocês compartilham o hobby Atividade fictícia.” Uma lista vazia informa somente que nenhuma regra V1 encontrou elemento em comum.

Não há score, percentual, peso, probabilidade, confiança, posição, popularidade, recomendação ou avaliação da pessoa. Aparência, fotos, renda, gênero, religião, política, saúde, orientação sexual, localização precisa e comportamento privado não participam.

## Implementação e testes

Foram criados os contratos `AffinityContext`, `AffinitySignal`, `AffinityExplanation` e `AffinityEngineInput`, além das funções puras `createAffinityContext` e `explainAffinity`. Nenhum endpoint, coleção, índice, tela ou persistência foi criado.

Os 25 testes focados validam os nove sinais, explicações obrigatórias, ausência de campos numéricos de classificação, normalização textual, filtros de contato, schemas estritos, imutabilidade e ausência de regras escondidas. Casos com bloqueio e suspensão usam a avaliação real de audiência e comprovam que nem conta verificada ignora a fronteira anterior. Injeções de CPF, UID, nascimento, contatos, mensagens, denúncias e campos privados são rejeitadas.

O checkpoint completo `npm run check` terminou com código 0: 283 testes unitários, 211 testes de Rules e 27 testes de integração, totalizando 521. Formato, lint, TypeScript strict, builds e scanner foram aprovados; o scanner final examinou 128 arquivos versionados/candidatos, sem ocorrências, e `npm audit` encontrou 0 vulnerabilidades. A checagem de compatibilidade Expo e as exportações Android/iOS foram aprovadas.

O runtime de Rules emitiu a exceção interna conhecida ao encerrar, após todos os testes passarem, sem alterar o código de saída. O Firestore Emulator deixou o processo Java 12360 ouvindo na porta 8080; a linha de comando confirmou o jar local, o projeto fictício e o caminho deste repositório antes do encerramento controlado.

## Divergências encontradas

- Os nomes conceituais iniciais de intensidade e intenção diferiam dos enums canônicos já existentes. O TypeScript detectou a divergência; os mapas foram corrigidos para os contratos vigentes antes do commit final da funcionalidade.
- `MATCH_ENGINE_INPUTS.md` ainda descrevia sinais como base para ordenação futura. O documento foi atualizado para refletir a Etapa 5: sinais servem exclusivamente à explicação, e qualquer ordenação requer nova decisão.
- O ADR solicitado foi numerado como 0014; o identificador 0013 permanece não atribuído, conforme registrado no próprio ADR.

## Riscos e limitações residuais

- Igualdade textual não entende sinônimos, contexto cultural ou equivalências editoriais.
- Textos públicos ainda podem tentar codificar contato; a fronteira filtra padrões comuns, mas moderação futura continua necessária.
- Muitas coincidências podem ser interpretadas como classificação se uma interface futura enfatizar contagem; a apresentação deve listar razões sem total competitivo.
- Uma futura entrega funcional precisará revalidar audiência e perfil vigente no mesmo fluxo, controlar enumeração, paginação, cotas, cache e auditoria.
- Catálogos e conteúdo reais dependem de governança editorial; nenhuma infraestrutura Firebase real ou dado real foi usado.

## Arquivos da etapa

Criados:

- `docs/AFFINITY_ENGINE.md`
- `docs/decisions/0014-affinity-over-ranking.md`
- `docs/stage-5-review.md`
- `packages/contracts/src/affinity.ts`
- `functions/src/domain/affinity-engine.ts`
- `packages/contracts/tests/affinity.test.ts`
- `tests/unit/affinity-engine.test.ts`

Alterados:

- `packages/contracts/src/index.ts`
- `docs/PROJECT_STATE.md`
- `docs/MATCH_ENGINE_INPUTS.md`
- `docs/architecture.md`
- `docs/authorization.md`
- `docs/data-model.md`
- `docs/security-principles.md`
- `docs/threat-model.md`

## Commits

- `310878f` — docs: define affinity engine principles
- `6ecd568` — feat: add affinity context contracts
- `d02e0f4` — feat: add explainable affinity rules
- `d68fb3d` — test: validate affinity explanations
- revisão documental final: registrada no commit que contém este relatório.

## Limite final

Etapa 5 concluída localmente. Parar para revisão. Publicação da branch, endpoint funcional, algoritmo de candidatos, score, ranking, recomendação, swipe, likes, match, chat, IA e machine learning dependem de nova autorização.
