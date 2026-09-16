# ADR 0005 — Regras negam todo acesso direto

Status: aceito. Contexto: segurança deve existir desde a primeira configuração Firebase.

Decisão: Firestore e Storage recusam leitura/escrita em qualquer caminho, anônimo, autenticado ou com claims privilegiadas. signals também fechado. Sem wildcard permissivo, exceções temporárias ou deploy para projeto real.

Consequências: testes negativos no Emulator Suite, fixtures semeadas via bypass exclusivo dos testes e controle de serviço funcionando. Qualquer abertura futura exige justificativa e testes. Rules não restringem Admin SDK/IAM ou emulador administrativo; esses acessos não devem alcançar o cliente.
