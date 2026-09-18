# ADR 0014 — Afinidade explicável sem ranking

Status: aceito para a Etapa 5 em 18/09/2026. O número 0014 é o identificador solicitado para esta decisão; 0013 permanece não atribuído.

## Contexto

A fronteira de audiência decide quem pode aparecer e o DiscoveryCard limita o que é mostrado. O próximo passo precisa explicar pontos em comum sem transformar pessoas em notas, criar ranking ou misturar segurança com atração.

## Decisão

Implementar AffinityEngine V1 com regras determinísticas, públicas e testáveis. O motor recebe uma decisão DiscoveryEligibility já aprovada e dois PublicProfileDTO autorizados, deriva contextos mínimos e retorna AffinityExplanation. O resultado contém sinais individuais e explicações; não contém número agregado.

Bloqueio, suspensão e demais estados impedem a etapa anterior. O motor apenas exige `canView: true` e `reason: eligible`; não reinterpreta motivo, estado da conta ou segurança. Falhas usam erro genérico e não revelam qual participante estava indisponível.

As regras V1 são igualdade de clube, ídolo, intensidade, interesse amplo em estádio, hobby, música, estilo de vida, pets e intenção. A ordem das regras é estável para apresentação, não ranking. Textos públicos são normalizados somente para comparação explícita.

## Privacidade

A fonte máxima é PublicProfileDTO. A derivação exclui nome, idade, cidade, bio e fotos por não serem necessários. Account, Identity, FanProfile persistido, CPF, UID, contato, localização precisa, atributos sensíveis, mensagens, denúncias e dados administrativos são recusados pela fronteira estrita.

## Consequências

Toda afinidade positiva é explicável e auditável. Uma lista vazia significa apenas que as regras V1 não encontraram elemento compartilhado. Não existe percentual, score, probabilidade ou recomendação.

A simplicidade reduz capacidade semântica: rock e rock alternativo não são considerados iguais sem valor textual equivalente. Isso é preferível a inferência invisível nesta fase.

## Alternativas rejeitadas

- score numérico agregado: incentiva ranking e falsa precisão;
- percentual público: comunica previsão inexistente;
- modelo de IA ou machine learning: inexplicável e prematuro para os dados disponíveis;
- fotos, popularidade ou comportamento privado: incompatíveis com finalidade e minimização;
- reutilizar bloqueios como sinal negativo: mistura segurança com atração e pode expor estado privado;
- ordenar pessoas pela quantidade de sinais: converte explicação em ranking indireto.

## Evolução

Pesos, agregados, estatística e machine learning dependem de nova decisão. Qualquer evolução deve preservar sinais explicáveis, separação da audiência, revisão humana e proibição de nota pessoal pública.
