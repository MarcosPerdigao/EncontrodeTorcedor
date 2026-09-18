# ADR 0012 — Fronteira de confiança e descoberta

Status: aceito para a Etapa 4 em 18/09/2026.

## Contexto

A projeção pública da Etapa 3.5 minimiza dados, mas não decide quem pode recebê-la. Expor perfis sem uma fronteira anterior permitiria enumeração, desrespeito a bloqueios e uso de verificação como passe irrestrito.

## Decisão

Criar contratos estritos para TrustContext, AudienceRule, DiscoveryEligibility e InteractionPermission e uma avaliação pura no servidor. A avaliação deriva TrustLevel de fontes internas, verifica participação de ambas as contas, aplica bloqueio bidirecional, separa visualização de interação e exige cota finita para qualquer interação futura.

A matriz inicial permite verified→basic, basic→verified e verified→verified. Basic→basic permanece decisão pendente e falha fechada. Uma preferência futura do alvo pode exigir verificação para iniciar interação, sem impedir a visualização já autorizada.

TrustLevel possui basic, verified, restricted, suspended e banned. Basic e verified descrevem somente o estágio de confiança da conta. Restricted, suspended e banned são estados bloqueantes derivados; nenhum nível é enviado pelo cliente nem publicado no perfil.

## Ordem obrigatória

1. validar fontes internas estritas;
2. derivar confiança e participação vigentes;
3. negar restrição, suspensão ou banimento;
4. aplicar bloqueio nas duas direções;
5. avaliar a matriz de visualização;
6. avaliar exigência de verificação e cota de interação;
7. somente em etapa futura autorizada, projetar PublicProfileDTO.

## Privacidade

A fronteira usa apenas estados mínimos. CPF, UID, contato, nascimento, localização precisa, detalhes de denúncia, token, claims e payload do perfil são recusados. Motivos públicos são genéricos para não revelar o estado privado do alvo.

## Consequências

A política pode ser testada sem construir descoberta ou ações sociais. Contadores, armazenamento de bloqueios, moderação, paginação e endpoints continuam ausentes. A aplicação futura deverá carregar os estados do servidor e nunca aceitar TrustContext, bloqueio ou cota informados pelo mobile.

A negação temporária de basic→basic evita assumir uma política não aprovada. Essa decisão reduz cobertura inicial e deverá ser revista antes de descoberta real.

## Alternativas rejeitadas

- usar selo do perfil como autorização: apresentação não é fonte de autoridade;
- permitir verified ignorar bloqueios ou cotas: transforma verificação em privilégio de abuso;
- devolver estado administrativo detalhado: facilita inferência e enumeração;
- implementar lista de candidatos nesta etapa: antecipa descoberta e algoritmo fora do escopo.
