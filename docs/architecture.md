# Arquitetura

## Decisão e estado

React Native + Expo + TypeScript strict, Cloud Functions, Cloud Firestore e Firebase Storage como infraestrutura inicial. Backend modular único; sem microserviços ou segundo banco. Fundação local apenas: nenhum projeto real de production ou staging é criado ou associado.

O cliente **não acessa Firestore/Storage diretamente para dados de negócio**. Firebase no dispositivo será avaliado na etapa de autenticação, ainda não autorizada. Nesta fundação não há SDK Firebase no pacote mobile, endpoints, autenticação, credenciais ou inicialização de Admin SDK.

## Fronteiras

```text
Aplicativo → autenticação gerenciada (futura)
Aplicativo → API → autorização por operação → Firestore / Storage privados
Storage em quarentena → processamento/moderação → derivados privados
API → outbox/tarefas → notificações genéricas
Painel separado → API administrativa com MFA, RBAC e auditoria
```

Admin SDK contorna Security Rules: toda função futura precisa validar identidade, sessão, estado da conta, elegibilidade, relação com recurso, bloqueios, campos e limites. IAM mínimo é uma proteção adicional, não substituto de autorização por usuário. Não confiar em UID recebido no payload.

Todos os DTOs usam allowlist explícita. Nunca retornar documento Firestore, snapshot, spread de entidade, caminho de Storage, UID alheio ou exceção interna. Referências opacas são vinculadas ao solicitante/contexto e não concedem autorização por si sós.

## Cliente

Rotas finas, features separadas, serviços de API e componentes visuais. TypeScript strict, validação de runtime e dependências mínimas. O esqueleto atual não precisa de rotas, formulários ou features vazias. Development builds são o caminho previsto para futuras integrações nativas; RN Firebase não funciona em Expo Go. Nesta etapa não provisionar EAS ou builds remotos.

Não persistir conversas/perfis de terceiros em armazenamento comum. Limpar caches controlados no logout e troca de conta. EXPO_PUBLIC é público, inclusive após empacotamento; não é cofre de segredos.

## Backend e descoberta futuros

Operações específicas em vez de CRUD genérico. Paginação com cursores vinculados a filtros e solicitante, cotas acumuladas, limite de candidatos examinados e allowlists de resposta. Não oferecer pesquisa irrestrita por UID, apelido ou listagem de usuários.

Firestore é adequado às consultas limitadas do MVP. Filtros combinatórios, joins e ranking complexo exigiriam reavaliar o banco. Medir leituras, egress, mídia e latência antes de prometer custos/escala. Limites por operação, quotas e teto de instâncias complementam alertas de orçamento.

`signals/{uid}` é uma exceção futura possível para um contador privado de atualização, não dado de negócio. **Permanece fechado nesta entrega**. Só abrir após necessidade funcional, revisão e testes específicos. Push não será fonte de verdade e reconexão provocará sincronização pela API.

## Interações futuras

Estado autoritativo por par, com chave determinística interna. Likes, bloqueios e envio de mensagem consultam esse estado em transações. Reciprocidade no mesmo contexto cria um único match. Idempotência vinculada a ator/operação/payload; efeitos externos somente após commit por outbox idempotente.

Bloqueio impede novos acessos e interações após confirmação. Mensagem confirmada antes do bloqueio já foi aceita. Não é possível apagar capturas, bytes recebidos ou garantir revogação de respostas em trânsito. Respostas neutras não revelam quem bloqueou. Desbloquear não ressuscita matches antigos.

Chat futuro: texto simples, paginação, sem preview automático de links e sem navegação livre da moderação por conversas. Não anunciar criptografia ponta a ponta; o desenho admite processamento restrito no servidor. Retenção ainda pendente.

## Mídia futura

Upload autorizado e limitado → quarentena privada → validação do conteúdo real e de pixels/bytes → decodificar/recodificar → remover EXIF/GPS e outros metadados → thumbnails → moderação → publicação de derivados. Nunca servir original. Sugestão inicial: seis fotos, 8 MB por envio e teto de pixels, a validar antes da feature.

Entrega de fotos por endpoint autenticado que verifica bloqueios e estado em cada acesso. Sem download tokens permanentes, URLs públicas ou URLs assinadas como mecanismo principal de revogação. Cache privado controlado. Capturas e scraping humano permanecem riscos residuais.

## Ambientes e operação

Local usa exclusivamente projeto fictício `demo-social-foundation` e emuladores em loopback. Development, staging e production serão projetos separados quando autorizados; não usar dados reais em testes. Nenhum alias real, deploy automático, service account ou secret é necessário agora.

App Check nativo, autenticação, IAM de produção, MFA e configuração de provedores são trabalho futuro. Emuladores não comprovam esses controles. Produção requer revisão dos buckets, Rules, IAM, backup, contratos, transferência internacional e resposta a incidentes.

## Fontes técnicas

- [Expo e Firebase](https://docs.expo.dev/guides/using-firebase/): SDK nativo exige development build.
- [Firestore e autorização](https://firebase.google.com/docs/firestore/security/rules-query): Rules não são filtros e Admin SDK as contorna.
- [Transações](https://firebase.google.com/docs/firestore/manage-data/transactions): callbacks podem repetir; não executar efeitos externos dentro deles.
- [Emulator Suite](https://firebase.google.com/docs/emulator-suite/install_and_configure): configuração local e de CI.

ADRs em [decisions](decisions/). Políticas de segurança e retenção prevalecem sobre conveniência técnica.
