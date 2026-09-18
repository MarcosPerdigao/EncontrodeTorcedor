# Modelo de DiscoveryCard

Status: contrato e projeção local da Etapa 4.5. Não existe endpoint, listagem funcional, ordenação, swipe ou interação.

## Papel do card

DiscoveryCard é uma apresentação reduzida de um PublicProfileDTO já autorizado pela fronteira de audiência. Seu objetivo é oferecer contexto inicial suficiente para a pessoa decidir se quer conhecer mais, sem reproduzir todo o perfil.

A ordem obrigatória futura é:

1. avaliar audiência no servidor;
2. obter ou gerar PublicProfileDTO pela allowlist aprovada;
3. projetar DiscoveryCard;
4. somente depois, entregar por paginação e controles ainda não implementados.

PublicProfileDTO é a única fonte de dados do card. Account, Identity, FanProfile, documentos Firestore, PhotoReference e estados administrativos nunca são recebidos pela projeção.

## Allowlist do card

O card pode conter:

- profileRef opaca;
- displayName;
- idade calculada já presente no perfil público;
- cidade ampla;
- até três referências públicas de foto já aprovadas;
- selo `verified` quando presente no perfil público;
- clube com nome público, intensidade e até dois nomes públicos de ídolos;
- bio curta, quando a regra de apresentação permitir;
- lifestyle público reduzido, quando permitido;
- intenções públicas, quando permitidas.

Experiência de estádio não entra no card. Mesmo sendo opcional no PublicProfileDTO, esse contexto exige a visualização completa futura e evita exposição precoce de rotina.

## Regras de apresentação

DiscoveryCardPresentation controla somente redução de informação:

- `photoLimit`: de 1 a 3;
- `idolLimit`: de 0 a 2;
- `showBio`;
- `showLifestyle`;
- `showConnectionIntents`.

A regra não adiciona dados ausentes, não altera selo, idade ou cidade e não aceita identificadores de conta. Ela deve ser definida pelo servidor/produto, não pelo mobile.

## Filtros declarativos

DiscoveryFilters representa preferências de consulta, sem score ou ordenação:

- faixa etária adulta válida;
- cidades canônicas, sem coordenadas ou distância;
- clubes canônicos;
- intenções de conexão;
- preferência `any` ou `verified_only`.

Filtro não concede audiência, não remove bloqueio e não garante resultado. A aplicação do filtro, paginação e geração do universo de candidatos continuam fora desta etapa.

## Dados proibidos

CPF, UID, accountRef, nascimento, e-mail, telefone, redes sociais, endereço, bairro, coordenadas, distância, token, trustLevel, estado de conta, elegibilidade, moderação, denúncia, score, rank e motivo de recomendação não pertencem ao card.

Firestore e Storage continuam deny-all para clientes. Referência pública de foto não é caminho de Storage nem autorização de download.

## Exposição gradual

O card é menor que o perfil público completo e não carrega campos omitidos. Uma futura tela completa deverá repetir autorização e bloqueio; não pode tratar o card como capability reutilizável. Cache, expiração, revogação de mídia, paginação opaca e mitigação de scraping continuam decisões futuras.

## Fora do escopo

Não há algoritmo, score, ranking, recomendação, machine learning, swipe, like, match, chat, endpoint de descoberta ou catálogo real novo.
