# Retenção, exclusão e direitos

Status: **prazos ainda sujeitos a decisão de produto e validação jurídica**. Nenhum job, TTL ou prazo de retenção de negócio será implementado na fundação.

## Mensagens

**180 dias é somente hipótese de arquitetura, não prazo aprovado.** Não é requisito, default, configuração, promessa ao titular nem valor a inserir no código. Prazo, marco inicial, tratamento ao desfazer match/excluir conta e preservação de evidências serão decididos antes da implementação do chat.

## Demais hipóteses para análise

| Classe                         | Hipótese inicial, não obrigação jurídica                            |
| ------------------------------ | ------------------------------------------------------------------- |
| Perfil/fotos/preferências      | Enquanto necessários para conta ativa                               |
| Original de imagem             | Eliminar após processamento; abandonados em até 24h                 |
| Likes sem reciprocidade/passes | Avaliar 90 dias                                                     |
| Exportação gerada              | Avaliar 24h, com download autenticado                               |
| Logs operacionais minimizados  | Avaliar 30 dias                                                     |
| Auditoria administrativa       | Avaliar 180 dias, política distinta de mensagens                    |
| Denúncias/evidências           | Prazo específico da finalidade/caso e eventual preservação legal    |
| Backups                        | Prazo finito a definir, com reaplicação de exclusões na restauração |

Não reter indefinidamente sob justificativa genérica de segurança. Documentar dado, finalidade, base legal, operador, acesso, marco temporal, exclusão e exceção de preservação. Dados sensíveis e inferências de preferências requerem avaliação específica; não usar consentimento genérico como solução universal.

## Exclusão futura

1. Reautenticar e registrar pedido idempotente.
2. Revogar acesso, retirar descoberta e impedir novas interações imediatamente após confirmação.
3. Limpar Auth, dados operacionais, subcollections, objetos, derivados, tokens, tarefas e referências.
4. Segregar somente evidência necessária com finalidade/base legal/prazo documentados.
5. Verificar conclusão, repetir falhas e oferecer protocolo ao titular.
6. Não reativar dados em restauração; aplicar exclusões antes de liberar ambiente restaurado.

Até sete dias para base operacional é apenas meta técnica proposta. Prazo dos backups e eventual retenção legal exigem definição própria. Remover um documento pai não remove suas subcollections; TTL não é revogação imediata. Caches/dados já recebidos por terceiros não podem ser recolhidos com garantia.

## Direitos e pontos de validação

Planejar consulta, correção, pausa, exportação, exclusão, revogação de escolhas opcionais e canal de privacidade. Exportação não pode entregar dados privados de terceiros, denúncias alheias ou informações administrativas. Avaliar mensagens e interesses sensíveis, aferição de idade, incidentes, guarda legal e contratos/transferências internacionais com profissional habilitado antes da operação.

Fontes: [LGPD](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm), [ANPD: transferências internacionais](https://www.gov.br/anpd/pt-br/assuntos/assuntos-internacionais/transferencia-internacional-de-dados), [Firestore TTL](https://firebase.google.com/docs/firestore/ttl), [Lei 15.211/2025](https://planalto.gov.br/ccivil_03/_ato2023-2026/2025/lei/l15211.htm).


## Sincronização 1.5

Nenhum prazo de mensagens foi aprovado. Definir retenção separada para nascimento privado, sessões, contadores, idempotência, provas mínimas de verificação, auditoria e analytics. CPF bruto ou simplesmente hashed não está autorizado. Evidência de incidente exige finalidade, acesso por caso e preservação controlada; denúncia coordenada não justifica retenção indefinida. Passaporte e Dia de Jogo exigirão políticas específicas antes das respectivas versões.
