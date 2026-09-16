# Modelo de dados proposto

Nenhuma collection de negócio é criada nesta fundação. Os nomes/campos abaixo são conceituais para implementação posterior autorizada. Fixtures dos testes são artificiais. Não transformar este modelo em DTO público.

## Classes de dados

1. Identidade privada: nascimento, contato no provedor, elegibilidade.
2. Perfil exibível: conteúdo mínimo aprovado e visível somente a audiência autorizada.
3. Relações: interesses recíprocos, mensagens, bloqueios e preferências privadas.
4. Operação restrita: denúncia, evidência, auditoria e autorização administrativa.

“Exibível” não significa público na internet ou legível diretamente no Firestore. Idade será calculada no servidor a partir do nascimento privado; o DTO não transporta a data.

## Collections futuras

| Caminho | Finalidade/campos | Relação e risco |
| --- | --- | --- |
| accounts/{uid} | status, eligibilityStatus, sessionVersion, timestamps | Autoridade da conta; cliente não pode alterar estado |
| identities/{uid} | birthDate, comprovação mínima de elegibilidade | Privado; sem senha ou coleta padrão de documento |
| profiles/{uid} | nickname, cityId, bio, interests, goals, photoIds, fanFields, visibility, moderationStatus | Somente projeção autorizada; moderacão/UID não saem no DTO |
| preferences/{uid} | modes, ageRange, cityScope, preferências opcionais | Não publicar; podem revelar informações sensíveis |
| consents/{uid}/records/{id} | finalidade, versão, decisão, timestamp, revogação | Histórico privado; sem consentimento genérico |
| media/{id} | ownerUid, paths, status, dimensions, moderation | Caminhos e proprietário internos |
| discoverySessions/{id} | solicitante, filtros, validade | Sessão com universo limitado de candidatos |
| discoverySessions/{id}/cards/{ref} | candidato interno, contexto, validade | Ref opaca vinculada ao solicitante |
| pairStates/{key} | participantes, bloqueios por direção, versão, estados por contexto | Fonte de verdade transacional |
| decisions/{id} | ator, alvo, contexto, like/pass, timestamps | Chave determinística interna; não revelar likes de terceiros |
| matches/{id} | participantes, contexto, status, timestamps | Criado somente após reciprocidade válida |
| matches/{id}/messages/{id} | autor, texto, sequência, timestamps | Mensagem privada; retenção pendente |
| reports/{id} | denunciante, alvo, motivo, descrição, refs, status, responsável | Só moderação; denunciante recebe protocolo separado |
| reportEvidence/{id} | evidência mínima, origem, retenção, legalHold | Não misturar com logs; acesso por caso |
| moderationActions/{id} | caso, operador, ação, motivo, timestamp | Auditoria da decisão |
| devices/{uid}/tokens/{id} | token FCM, plataforma, atualização | Tokens nunca públicos |
| signals/{uid} | contador de atualização | Possível leitura própria futura; fechado agora |
| privacyRequests/{id} | titular, tipo, estado, prazo, referência do resultado | Exportação não expõe dados privados de terceiros |
| rateLimits/{key} | janela, contador, expiração | Só serviço; sem contador global concentrador |
| operations/{id} | ator, operação, chave idempotente, estado, validade | Impede repetição de efeitos |
| outbox/{id} | evento, versão, tentativas, estado | Trabalho assíncrono após commit |
| staffAccess/{uid} | papel, estado, escopo | Provisionamento privilegiado; nunca campo editável no perfil |
| auditEvents/{id} | operador, ação, recurso, justificativa, resultado | Sem payload sensível; cópia protegida independente |

Versão 2 somente: games/{id} e gameAttendance/{id}. Presença em partida precisa de audiência explícita e expiração; não é diretório público.

## Índices a implementar com as consultas

- Descoberta: elegibilidade + cidade + modo + chave de distribuição.
- Conexões: participantes array-contains + status + última atividade.
- Decisões: ator + contexto + criação.
- Mensagens: sequência e desempate estável.
- Mídia: proprietário + status + criação.
- Denúncias: status + prioridade + criação.
- Privacidade: titular + criação; estado + prazo.

O arquivo de índices inicial fica vazio: não criar índices especulativos. Desabilitar indexação de campos grandes/sensíveis quando o modelo for implementado. Não armazenar listas crescentes de mensagens/likes em um documento.

## Contratos nesta fundação

`PrivateUserData` terá módulo de tipos separado e não será reexportado no ponto público. É contrato interno mínimo, não autorização para coletar todos os campos privados possíveis.

`PublicProfileDTO` terá allowlist exata, strings/arrays validados, referência opaca e parser estrito. O teste mantém expectativa independente do schema: adicionar um campo ao DTO sem revisão deve falhar. Não usar Omit de entidade privada: um campo futuro poderia vazar por omissão de manutenção da denylist.

Nascimento, contato, documento, IP, tokens, UID, verificação, administração e todos os campos de localização precisa não podem entrar no DTO. Campos de localização precisa sequer pertencem ao modelo do MVP. Referência opaca não deve ser UID renomeado ou UID codificado em base64.

Bloqueios, paginação, exclusão de subcollections e consistência serão testados quando existirem os casos de uso, sem antecipar essas funcionalidades agora.
