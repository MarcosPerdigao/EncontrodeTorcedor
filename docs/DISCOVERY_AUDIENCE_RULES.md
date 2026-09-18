# Regras de audiência da descoberta

Status: política conceitual da Etapa 4. Não existe endpoint de descoberta, listagem de candidatos ou interação social.

## Princípios

Visualização e interação são decisões separadas. Ser visível não concede permissão para iniciar contato. Toda decisão ocorre no servidor com estado vigente, nega por padrão e é anterior à projeção do PublicProfileDTO.

A verificação indica somente que a conta concluiu uma etapa adicional. Não mede caráter, compatibilidade, segurança pessoal ou importância social. Conta básica não recebe rótulo negativo.

## Níveis derivados

TrustLevel é derivado de estado da conta, elegibilidade, verificação de identidade e restrição de segurança:

- basic: conta acessível sem verificação concluída;
- verified: conta acessível com verificação concluída;
- restricted: conta inelegível ou com restrição de segurança vigente;
- suspended: conta suspensa, excluída ou em exclusão;
- banned: conta banida.

O cliente não envia nem altera TrustLevel. Um nível verified não supera bloqueio, restrição, suspensão, banimento ou limite de abuso.

## Matriz de visualização

| Visualizador                    | Perfil alvo                     | Visualização               | Observação                                                                    |
| ------------------------------- | ------------------------------- | -------------------------- | ----------------------------------------------------------------------------- |
| verified                        | basic                           | Permitida pela fronteira   | Ainda exige perfil público válido, ausência de bloqueio e limites do servidor |
| basic                           | verified                        | Permitida pela fronteira   | Visualizar não garante interação                                              |
| verified                        | verified                        | Permitida pela fronteira   | Sem acesso ilimitado                                                          |
| basic                           | basic                           | Pendente; negar por padrão | A política de produto será decidida em etapa posterior                        |
| restricted, suspended ou banned | qualquer                        | Negada                     | Token válido não restaura participação                                        |
| qualquer                        | restricted, suspended ou banned | Negada                     | O perfil não entra na audiência                                               |

A conta precisa estar acessível, adulta elegível ou em revisão adulta permitida e possuir perfil público pronto. Uma ausência falha fechada sem expor qual condição privada bloqueou a participação.

## Interação

Uma conta verified pode iniciar uma futura interação com conta basic dentro de cota do servidor. Uma conta basic pode visualizar uma conta verified, mas, se o alvo exigir contas verificadas, o resultado indica `verification_required` sem criar mensagem, convite ou like.

Toda interação futura terá limite finito por janela. Esgotar a cota retorna `rate_limited`. A fronteira não implementa persistência do contador, ação social ou entrega de mensagem; apenas exige e avalia o estado do limite fornecido pelo servidor.

## Bloqueio e segurança

Bloqueio funciona nas duas direções: se A bloqueou B ou B bloqueou A, nenhum dos dois pode ver ou interagir com o outro. A regra vale inclusive para contas verified.

Restrições derivadas de segurança ou denúncias revisadas retiram a conta da audiência. Contagens, motivos, protocolos e detalhes de denúncia não entram no contexto ou no resultado de audiência.

## Privacidade e minimização

A avaliação não recebe nem devolve CPF, UID, nascimento, e-mail, telefone, token, endereço, coordenadas, distância, detalhes de denúncia ou dados administrativos. Referências opacas também não substituem autorização.

Sem GPS no MVP. Cidade ou região ampla poderão limitar um universo futuro, mas localização precisa e distância exata permanecem proibidas.

## Controles exigidos antes de descoberta real

- paginação opaca, pequena e limitada;
- cotas por conta, dispositivo, rede e operação em camada apropriada;
- universo de candidatos gerado no servidor, sem enumeração por identificador;
- exposição gradual e sem endpoint de listagem irrestrita;
- detecção de automação e repetição;
- auditoria por eventos mínimos, sem payload de perfil;
- App Check e controles do provedor avaliados antes de ambiente real;
- bloqueio aplicado antes de projetar o perfil.

## Decisões pendentes

- se basic pode descobrir basic;
- se uma futura conversa exige verificação de uma ou das duas contas;
- valores reais das cotas e suas janelas;
- efeito de preferências adicionais na audiência;
- processo de restrição baseado em denúncias e respectivo recurso;
- paginação, diversidade, antifraude e auditoria operacionais.

Nenhuma dessas pendências autoriza algoritmo, score, ranking, cards, swipe, like, match ou chat.
