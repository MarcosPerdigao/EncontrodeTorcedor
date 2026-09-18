# Entradas do motor de afinidade

Status: implementadas localmente na Etapa 5 como contexto efêmero e explicável. Não existe ranking, score, consulta de descoberta, recomendação ou analytics.

## Fronteira anterior

`DiscoveryEligibility` decide se a dupla pode chegar ao motor. Conta suspensa, banida, restrita ou inelegível e bloqueio em qualquer direção encerram o fluxo antes de qualquer explicação. O motor não recebe nem reinterpreta esses estados.

## Sinais explicáveis

Somente atributos presentes no `PublicProfileDTO` autorizado podem formar `AffinityContext`:

- clube principal e ídolos canônicos;
- intensidade da torcida e interesse amplo em estádio;
- hobbies e música públicos;
- estilo de vida e relação com pets públicos;
- intenções de conexão públicas.

Esses sinais explicam pontos em comum. Eles não ordenam candidatos e não medem qualidade, atração ou probabilidade de relacionamento. A ordem estável das regras serve apenas à apresentação.

## Campos excluídos

Nome, idade, cidade, foto e bio não são necessários às regras V1. UID, accountRef, CPF, nascimento, contato, localização precisa, prova de identidade, renda, gênero, religião, política, saúde, orientação sexual, mensagens, denúncias, comportamento privado e dados administrativos nunca são entrada.

## Evolução condicionada

Pesos, agregados, comportamento, ordenação, estatística e machine learning não estão autorizados. Qualquer evolução exige nova decisão, avaliação de viés e privacidade, versão auditável e preservação das explicações sem nota pessoal ou percentual público.
