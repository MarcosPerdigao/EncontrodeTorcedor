# ADR 0002 — Backend mediando dados de negócio

Status: aceito. Contexto: acesso direto dificulta cotas acumuladas, projeções mínimas e verificação uniforme de bloqueios.

Decisão: todas as leituras/escritas de negócio passam por operações específicas do servidor, inclusive mensagens e entrega de fotos. Nunca retornar documentos Firestore; DTOs com allowlist. Admin SDK exige autorização própria e IAM mínimo.

Alternativa: SDK cliente com Rules rigorosas. Não adotada para dados de negócio deste produto.

Consequências: chamadas adicionais e API responsável por paginação, limites e estado. signals/{uid} pode futuramente transportar só um contador privado, com decisão/testes específicos; continua negado agora. Sem endpoints nesta fundação.
