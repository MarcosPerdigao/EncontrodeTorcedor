# ADR 0001 — Firebase como infraestrutura inicial

Status: aceito para a base. Contexto: MVP com equipe pequena, consultas limitadas, necessidade de autorização e processamento no servidor.

Decisão: Expo/React Native/TypeScript, backend modular em Cloud Functions, Firestore e Storage privados. Auth gerenciado será integrado somente após autorização da etapa correspondente. Sem microserviços, SQL adicional ou integrações esportivas.

Alternativa: PostgreSQL favorece consultas relacionais complexas, mas adicionaria trabalho sem necessidade atual. Reavaliar se filtros/ranking/relatórios ultrapassarem o desenho limitado.

Consequências: medir leituras, egress, concorrência e custos; manter domínio separado do SDK. Firebase não elimina responsabilidade por autorização, IAM, moderação ou LGPD. Emuladores e projeto demo agora; produção não provisionada.
