# ADR 0007 — Correções transitivas e ferramentas locais restritas

Status: aceito para a fundação; não altera o produto nem abre permissões de dados.

A auditoria inicial apontou 17 alertas moderados transitivos. Em vez de ignorar advisories ou aplicar downgrade automático de Expo/Firebase, o workspace fixa correções de uuid 11.1.1, re2 1.26.1, csv-parse 7.0.2 e @opentelemetry/core 2.8.0 nos consumidores afetados. Testes verificam as APIs consumidas, além de emuladores e export mobile.

O Firebase CLI 15.30.1 depende de stream-json 1.9.1. A correção disponível 3.6.0 tem API incompatível; um override cego quebraria a ferramenta. A fundação precisa dos emuladores, não de importação de usuários/Realtime Database ou pipelines de Next Hosting. O override local @social/disabled-json-import substitui esse parser por fábricas que sempre falham antes de processar dados. Não há cópia do código vulnerável, alteração fictícia de versão ou supressão de auditoria.

Consequência explícita: a instalação do Firebase CLI deste repositório não é uma ferramenta geral de importação/deploy. Só os comandos de emulador documentados são suportados. O pacote de bloqueio não vai para o app ou Cloud Functions. Reavaliar/remover o override quando o upstream adotar uma dependência segura compatível, com nova revisão e testes. Qualquer novo uso do CLI exige verificar esta restrição.

A auditoria continua obrigatória para toda a árvore e falha em severidade moderate ou superior. Essa decisão remove capacidade não autorizada, em vez de criar uma exceção temporária de segurança.

Fontes: [stream-json e histórico de APIs](https://github.com/uhop/stream-json), [advisory do parser](https://github.com/advisories/GHSA-528h-pc64-c93x), [Firebase CLI](https://github.com/firebase/firebase-tools).
