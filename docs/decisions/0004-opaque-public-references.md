# ADR 0004 — Referências opacas em contratos públicos

Status: aceito. Contexto: UIDs expostos facilitam correlação e enumeração, mesmo quando não constituem segredo de autenticação.

Decisão: contrato público usa referências opacas de propósito definido, geradas no servidor sem codificar UID, com vínculo a solicitante/contexto e validade quando aplicável. UIDs alheios e paths internos não saem da API.

Alternativa: usar UID como profileId ou convertê-lo para base64. Rejeitada: renomear/codificar não remove a correlação.

Consequências: resolução interna e testes de IDOR serão necessários. A fundação define apenas a forma do contrato e fixtures sintéticas, sem gerador, endpoint ou persistência. Uma referência válida sintaticamente não prova autorização nem aleatoriedade.
