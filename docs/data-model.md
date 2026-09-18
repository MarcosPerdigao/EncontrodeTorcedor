# Modelo de dados proposto

A etapa 2 persiste somente conta, identidade mínima e metadados de sessão nos emuladores, conforme stage-2-review.md. A tabela geral abaixo continua conceitual para demais funcionalidades futuras. Fixtures dos testes são artificiais. Não transformar este modelo em DTO público.

## Classes de dados

1. Identidade privada: nascimento, contato no provedor, elegibilidade.
2. Perfil exibível: conteúdo mínimo aprovado e visível somente a audiência autorizada.
3. Relações: interesses recíprocos, mensagens, bloqueios e preferências privadas.
4. Operação restrita: denúncia, evidência, auditoria e autorização administrativa.

“Exibível” não significa público na internet ou legível diretamente no Firestore. Idade será calculada no servidor a partir do nascimento privado; o DTO não transporta a data.

## Collections futuras

| Caminho                            | Finalidade/campos                                                  | Relação e risco                                              |
| ---------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------ |
| accounts/{uid}                     | status, eligibilityStatus, sessionVersion, timestamps              | Autoridade da conta; cliente não pode alterar estado         |
| identities/{uid}                   | birthDate, comprovação mínima de elegibilidade                     | Privado; sem senha ou coleta padrão de documento             |
| publicProfileSettings/{uid}        | displayNameKind, displayName, cityId, bio, opt-ins                 | Configuração privada; selo/idade/moderação não são editáveis |
| preferences/{uid}                  | modes, ageRange, cityScope, preferências opcionais                 | Não publicar; podem revelar informações sensíveis            |
| consents/{uid}/records/{id}        | finalidade, versão, decisão, timestamp, revogação                  | Histórico privado; sem consentimento genérico                |
| media/{id}                         | ownerUid, paths, status, dimensions, moderation                    | Caminhos e proprietário internos                             |
| discoverySessions/{id}             | solicitante, filtros, validade                                     | Sessão com universo limitado de candidatos                   |
| discoverySessions/{id}/cards/{ref} | candidato interno, contexto, validade                              | Ref opaca vinculada ao solicitante                           |
| pairStates/{key}                   | participantes, bloqueios por direção, versão, estados por contexto | Fonte de verdade transacional                                |
| decisions/{id}                     | ator, alvo, contexto, like/pass, timestamps                        | Chave determinística interna; não revelar likes de terceiros |
| matches/{id}                       | participantes, contexto, status, timestamps                        | Criado somente após reciprocidade válida                     |
| matches/{id}/messages/{id}         | autor, texto, sequência, timestamps                                | Mensagem privada; retenção pendente                          |
| reports/{id}                       | denunciante, alvo, motivo, descrição, refs, status, responsável    | Só moderação; denunciante recebe protocolo separado          |
| reportEvidence/{id}                | evidência mínima, origem, retenção, legalHold                      | Não misturar com logs; acesso por caso                       |
| moderationActions/{id}             | caso, operador, ação, motivo, timestamp                            | Auditoria da decisão                                         |
| devices/{uid}/tokens/{id}          | token FCM, plataforma, atualização                                 | Tokens nunca públicos                                        |
| signals/{uid}                      | contador de atualização                                            | Possível leitura própria futura; fechado agora               |
| privacyRequests/{id}               | titular, tipo, estado, prazo, referência do resultado              | Exportação não expõe dados privados de terceiros             |
| rateLimits/{key}                   | janela, contador, expiração                                        | Só serviço; sem contador global concentrador                 |
| operations/{id}                    | ator, operação, chave idempotente, estado, validade                | Impede repetição de efeitos                                  |
| outbox/{id}                        | evento, versão, tentativas, estado                                 | Trabalho assíncrono após commit                              |
| staffAccess/{uid}                  | papel, estado, escopo                                              | Provisionamento privilegiado; nunca campo editável no perfil |
| auditEvents/{id}                   | operador, ação, recurso, justificativa, resultado                  | Sem payload sensível; cópia protegida independente           |

V2: Passaporte do Torcedor, histórico opcional e agregados por padrão. V3: games/{id} e gameAttendance/{id} para presença voluntária/temporária, somente após análise específica de stalking. Nenhum desses modelos é implementado agora.

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

## Sincronização 1.5: multiclube e identidade

Prever clubs, idols e idolAliases com IDs canônicos, status editorial e aliases. Motivo de inelegibilidade editorial separado e restrito. Usar clubId, clubPreferences e fanProfile; nenhum tipo específico do clube piloto. Preferências de torcida são bilaterais e simpatias autodeclaradas, sem alianças oficiais. Ver PROFILE_MODEL.md.

Distinguir report, reviewedReport, substantiatedReport e safetyIncident; apenas processo de revisão pode produzir procedência, com deduplicação, integridade e contestação. Sem banimento por contagem bruta. Nenhuma automação disciplinar implementada na etapa 2.

Etapa 2 autoriza modelo de conta, sessão e nascimento privado mínimo. CPF bruto ou simplesmente hashed permanece proibido, inclusive logs/fixtures reais. Provas mínimas de provedor futuro alimentam status, sem documento civil nos demais módulos. A implementação mínima foi autorizada após essa revisão e está registrada em stage-2-review.md; o restante continua futuro.

## Modelo implementado na Etapa 3

fanProfiles/{hash-do-uid} contém somente o agregado FanDomain validado: referência opaca, clube/ídolos canônicos, intensidade, estádio/história opcionais, preferências autodeclaradas, intenções e lifestyle opcional. O hash é chave interna de particionamento e não sai da API. O documento não contém UID, accountRef, CPF, nascimento, contato, trustLevel ou estado administrativo.

Account e Identity permanecem collections separadas. trustLevel é projeção calculada a partir de identityVerificationStatus e não é persistido no perfil. A resposta de criação devolve somente SessionDTO e FanDomain do titular. Não é PublicProfileDTO e não autoriza exposição a terceiros.

## Projeção pública da Etapa 3.5

PublicProfileDTO não é persistência nem espelho de FanDomain. A projeção recebe Account/Identity/FanDomain/configuração/catálogos/fotos já autorizados e devolve somente a allowlist. Idade é calculada; selo é derivado; IDs de clube/ídolo, status editoriais e preferências privadas não saem.

PhotoReference interno contém photoId opaco, ownerAccountRef, status, ordering e moderationStatus. Não há coleção, upload ou Storage aberto nesta etapa. Somente contrato e filtro de exposição foram implementados.

## Estado conceitual de audiência

A Etapa 4 não cria collections. Uma integração futura precisará obter bloqueios bidirecionais, restrição derivada e consumo de cota de fontes protegidas e consistentes. Detalhes de denúncia, estado administrativo e contadores não pertencem ao PublicProfileDTO.

TrustContext e AudienceRule são valores internos efêmeros. DiscoveryEligibility e InteractionPermission são decisões mínimas; não constituem lista de candidatos, match ou autorização reutilizável.

## DiscoveryCard e filtros

DiscoveryCard, DiscoveryFilters e DiscoveryCardPresentation não criam collections na Etapa 4.5. São contratos e valores efêmeros. O card não deve ser persistido como cópia divergente de PublicProfileDTO sem decisão futura de cache, validade e revogação.

## Contexto e explicação de afinidade

`AffinityContext`, `AffinitySignal` e `AffinityExplanation` são valores efêmeros da Etapa 5. Nenhuma collection, documento, índice ou cache foi criado. Não persistir explicações como histórico comportamental sem finalidade, retenção e revisão próprias.

A fonte máxima é `PublicProfileDTO`; Account, Identity e FanProfile persistido não entram no motor. A allowlist exclui identificadores internos, contato, nascimento, localização precisa, mensagens, denúncias e estado administrativo.
