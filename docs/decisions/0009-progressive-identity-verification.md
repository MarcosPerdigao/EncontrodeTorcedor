# ADR 0009 — Verificação progressiva de identidade

Status: aceito para a Etapa 3 em 18/09/2026. Substitui a exigência de verificação antes do primeiro perfil descrita como hipótese na Etapa 2.

## Contexto

Exigir prova de identidade no primeiro cadastro aumenta abandono antes que a pessoa conheça o produto. A ausência de verificação, porém, não pode ignorar idade, estado da conta, bloqueios ou controles de abuso.

## Decisão

A conta começa com identityVerificationStatus igual a not_started. Após e-mail confirmado e declaração de idade adulta ainda em review_required, a pessoa pode criar sua identidade de torcedor e usar apenas funções básicas autorizadas. O nível de confiança é derivado pelo servidor:

- basic: identidade não verificada; não significa suspeita.
- verified: provedor futuro concluiu a verificação.

A comunicação recomendada é: “A verificação ajuda a manter a comunidade segura.” Verificação futura aumenta confiança e poderá liberar capacidades definidas em decisões posteriores. Nunca altera clube, ídolos, intenções ou estilo de vida.

CPF não entra no cadastro, mobile, logs, analytics, contratos comuns ou identificadores internos. Esta etapa não implementa coleta de documento nem provedor real.

## Controles preservados

Conta suspensa, banida, inelegível, excluída ou em exclusão continua bloqueada com token válido. E-mail e declaração de idade adulta são exigidos antes do perfil básico; declaração não prova idade. O cliente não envia nem altera status de conta, elegibilidade, confiança ou verificação. Firestore e Storage continuam fechados ao cliente.

## Alternativas avaliadas

- Verificação obrigatória antes do perfil: mais atrito e coleta antecipada.
- Liberar todas as capacidades sem verificação: não há análise de risco para recursos futuros.
- Tratar não verificado como suspeito: cria estigma e comunica uma garantia que o sistema não possui.
- Armazenar CPF internamente: desnecessário e incompatível com minimização; rejeitado.

## Impactos e riscos

A entrada melhora, mas aumenta exposição a perfis falsos e abuso no nível básico. Antes de descoberta será necessário definir limites por confiança, moderação, denúncia, bloqueio, antifraude, App Check e controles do provedor. Selo verificado não pode prometer segurança da pessoa. A definição de capacidades completas e o provedor de identidade continuam pendentes.
