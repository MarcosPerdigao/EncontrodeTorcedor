# Importação JSON desabilitada na ferramenta local

Pacote privado que substitui `stream-json` apenas na árvore de `firebase-tools` via npm override. Não implementa parser, não processa entrada e não mascara uma versão vulnerável: remove essa capacidade da ferramenta. Todos os construtores/fábricas expostos lançam erro antes de ler dados.

Motivo: GHSA-528h-pc64-c93x afeta a versão 1.9.1 exigida pelo Firebase CLI 15.30.1. A linha corrigida 3.6 usa outra API e não é uma substituição compatível. Os emuladores Firestore/Storage não precisam das pipelines de importação Auth/Realtime Database/Next Hosting. Essas pipelines ficarão indisponíveis nesta fundação.

Não há deploy nem importação de dados reais autorizados. A restrição é fail-closed, não exceção de auditoria. Testes comprovam o bloqueio e executam os emuladores reais. Não usar este CLI para funções além das documentadas. Remover o override somente quando o upstream incorporar uma versão segura compatível e repetir as verificações.

Fontes: https://github.com/advisories/GHSA-528h-pc64-c93x e https://github.com/uhop/stream-json.
