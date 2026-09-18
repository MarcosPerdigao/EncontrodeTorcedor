# Threat model

Estimativas iniciais antes das mitigações, não medições. Ativos: identidade, nascimento, preferências, relações, imagens, conversas, denúncias, credenciais e privilégios. Agentes: cliente manipulado, usuários abusivos, bots, fraudadores, sessões roubadas, insiders e dependências comprometidas.

Fronteiras: dispositivo → Auth/API → banco/Storage; mídia → processador; serviço → notificações; operador → API administrativa. Na etapa 2 existem Auth e API de conta somente em emuladores locais; controles das demais features abaixo são requisitos futuros, não funcionalidades já entregues.

| Risco                                      | Impacto | Probabilidade             | Mitigação / limite                                                                     |
| ------------------------------------------ | ------- | ------------------------- | -------------------------------------------------------------------------------------- |
| Scraping                                   | Alto    | Alta                      | Sem leitura direta/diretório; API com cotas acumuladas e refs por solicitante          |
| Stalking/correlação                        | Crítico | Alta                      | Minimização, sem redes sociais/presença por padrão; capturas continuam possíveis       |
| Triangulação                               | Crítico | Alta se coletar distância | GPS/coordenadas/geohash/bairro fora do MVP                                             |
| Enumeração                                 | Alto    | Alta                      | Proteções reais do provedor, respostas genéricas e testes de endpoints                 |
| Engenharia reversa                         | Alto    | Alta                      | Cliente inteiramente não confiável, sem segredos ou política autoritativa              |
| API manipulada/IDOR                        | Crítico | Alta                      | Identidade do token, autorização por objeto/ação, referências opacas                   |
| Firebase aberto                            | Crítico | Média                     | Rules negam tudo, testes emulador, IAM mínimo e revisão de deploy futuro               |
| Match forjado                              | Alto    | Alta                      | Reciprocidade transacional, contexto e idempotência                                    |
| Corrida bloqueio/mensagem                  | Crítico | Média                     | Estado compartilhado do par, ordem de commit, rechecagem em leitura/mídia              |
| Spam/bots                                  | Alto    | Alta                      | Limites por operação/conta/risco e App Check futuro; dispositivo válido pode abusar    |
| Golpes/perfis falsos                       | Crítico | Alta                      | Moderação, denúncia, restrições progressivas e contestação                             |
| Menores                                    | Crítico | Alta                      | Aferição proporcional validada; checkbox não basta; elegibilidade separada do login    |
| Upload malicioso                           | Crítico | Alta                      | Quarentena, limites de bytes/pixels, decodificação e recodificação                     |
| EXIF/GPS em fotos                          | Crítico | Alta                      | Remover metadados e não servir original                                                |
| Abuso no chat                              | Crítico | Alta                      | Match, bloqueio, denúncia contextual e limites                                         |
| Brute force/credential stuffing            | Alto    | Alta                      | Controles Auth, revogação e proteção adaptativa; limite de API não protege Auth direto |
| Sessão roubada                             | Crítico | Média                     | Armazenamento nativo, reautenticação sensível e estado vigente no servidor             |
| Tokens/secrets em logs/bundle              | Crítico | Média                     | Allowlist de logs, scanner, sem secrets no mobile/repositório                          |
| API key pública indevidamente privilegiada | Alto    | Alta                      | Restrições por API/quota; configuração pública não concede autorização                 |
| Insiders/admin abusivo                     | Crítico | Média                     | MFA, RBAC por caso, auditoria independente, sem autoelevação                           |
| Exportação indevida                        | Crítico | Média                     | Reautenticação, escopo do titular, download autenticado e expiração                    |
| Denúncias maliciosas                       | Alto    | Alta                      | Deduplicação e revisão; não banir apenas por volume                                    |
| Push revelador                             | Alto    | Média                     | Mensagens genéricas sem interlocutor/conteúdo                                          |
| Ataque de custo/DoS                        | Alto    | Alta                      | Limites antes de processamento caro, quotas e teto de instâncias                       |
| Supply chain                               | Crítico | Média                     | Lockfile, versões revisadas, análise de dependências e mínimo necessário               |
| Exclusão incompleta/restauração            | Crítico | Média                     | Job verificável, subcollections/mídias, registro de exclusão reaplicado                |

## Logs

Permitir somente requestId, operação, resultado categorizado, latência e métricas minimizadas. Proibir senha, token, documento, nascimento, conteúdo de conversa, coordenadas, bio e payloads completos. Revisar também logs de infraestrutura, ferramentas de erro e provedores. Não ativar gravação de sessões.

Identificadores pseudonimizados continuam potencialmente pessoais; restringir acesso e retenção. Evidência de denúncia é dado de caso, não log. Rotação/retention e auditoria administrativa precisam ser configuradas antes da operação real.

## Revisão adversarial da fundação

Atacante pode modificar bundle, forjar caminhos/payloads e usar SDK/REST diretamente. Resultado esperado: get/list/create/update/delete Firestore e toda operação Storage negadas, com ou sem identidade ou claims. Não há endpoints alternativos nem credenciais distribuídas.

Este resultado não prova IAM de um ambiente real ainda inexistente, não protege contra roubo de credencial administrativa e não torna emuladores seguros para internet. Vincular emuladores somente a loopback; seu bypass administrativo é exclusivo de testes artificiais.

Mudança de política, endpoint, SDK móvel ou coleta exige atualizar esta análise e adicionar testes negativos antes de uso.

## Riscos adicionais multiclube e identidade

Brigading entre torcidas exige deduplicar denúncias e avaliar procedência, não contagem bruta. Autocomplete/aliases exigem moderação e decisões editoriais auditáveis; não julgar automaticamente por notícias ou IA. Há risco de expor preferências privadas em explicações de compatibilidade: usar somente atributos autorizados. Analytics de coortes pequenas pode reidentificar pessoas.

Etapa 2 deve testar tokens inválidos, revogação lógica, claims antigas, estados forjados, nascimento adulterado e enumeração no provedor. CPF possui espaço limitado: não armazenar bruto ou hash simples. Nascer há 18 anos não prova identidade/idade declarada. Não ativar conta automaticamente com declaração. App Check não substitui autenticação. Provedores reais e controles de lançamento permanecem pendentes.

## Riscos da confiança progressiva

Permitir perfil básico antes de verificação reduz atrito e amplia risco de identidades falsas, contas em massa e engenharia social. A mitigação vigente limita-se a conta autenticada, e-mail confirmado, declaração adulta em revisão, autorização transacional, cotas e estados bloqueantes. Descoberta e interação continuam indisponíveis.

Antes de expor pessoas entre si: definir capacidades por nível, antifraude, App Check, moderação, bloqueio e denúncia; medir abuso sem registrar CPF, payload de perfil ou localização; impedir que o selo seja interpretado como garantia. O cliente não escolhe trustLevel nem identityVerificationStatus. Um provedor futuro recebe dados em fronteira dedicada e devolve prova mínima; evidências e documentos não pertencem ao perfil.

## Riscos da projeção pública

Mesmo um DTO mínimo pode facilitar scraping, correlação, assédio e inferência de rotina. Cidade, setor de estádio e intenções exigem audiência e bloqueio antes de qualquer consulta de terceiros. Opt-in pode ser obtido por interface enganosa; texto pode codificar contato apesar de filtros; selo pode ser interpretado como garantia.

A Etapa 3.5 mitiga vazamento estrutural com allowlist, nomes canônicos, selo/idade derivados, bio limitada e fotos filtradas. Ainda faltam endpoint autorizado, bloqueio, cotas, moderação textual, upload seguro, revogação/cache de mídia e testes de abuso. Por isso não existe descoberta nem rota pública.

## Ameaças da audiência

A fronteira reduz exposição indevida, mas ainda depende de armazenamento futuro confiável. Corridas no contador podem exceder cotas; cache pode manter bloqueio antigo; diferenças de resposta podem revelar existência ou estado; múltiplas contas e automação podem contornar limites simples.

Antes de qualquer endpoint: aplicar bloqueio e estado vigente na mesma decisão, consumir cota de modo atômico, limitar por camadas, uniformizar respostas, testar enumeração e automação e auditar sem armazenar payload do perfil ou detalhes sensíveis.
