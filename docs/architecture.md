# Arquitetura

## Decisão e estado

React Native + Expo + TypeScript strict, Cloud Functions, Cloud Firestore e Firebase Storage como infraestrutura inicial. Backend modular único; sem microserviços ou segundo banco. Fundação local apenas: nenhum projeto real de production ou staging é criado ou associado.

O cliente **não acessa Firestore/Storage diretamente para dados de negócio**. Na etapa 2 há Firebase App/Auth no dispositivo, exclusivamente emulado e com memória volátil, e API de conta no backend local. Ver ADR 0008 para decisões, endpoints e bloqueios de ambiente real. As demais funcionalidades descritas como futuras permanecem não implementadas.

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

## Evolução aprovada em 1.5

Uma plataforma nacional multiclube; piloto Atlético Mineiro como dado, sem acoplamento técnico. Cultura, clubes e ídolos são catálogos futuros. SAFETY_CHARTER.md rege produto, PROJECT_STATE.md registra estado e ROADMAP.md substitui cronogramas anteriores: Passaporte V2 e Dia de Jogo V3. Encontro Seguro não é autorizado no MVP.

Os parágrafos que descrevem aplicativo vazio e ausência de endpoints registram a base 0/1. A Etapa 2 foi autorizada e concluída após revisão intermediária e CI. A Etapa 3 foi autorizada posteriormente apenas para onboarding e perfil de torcedor; demais features continuam bloqueadas. Rules permanecem fechadas e não existe produção.

Separar auditoria operacional de analytics agregados/pseudonimizados. Futuras recomendações exigem versão de algoritmo e razões mínimas auditáveis; não registrar perfil inteiro nem dados privados. Hard filters bilaterais precedem ranking configurável, sem percentual público de compatibilidade.

## Etapa 3 — onboarding e confiança progressiva

A API local adiciona POST /fan-profile/create. A identidade continua derivada do token e da sessão lógica; o caminho interno do perfil usa hash do UID e nenhum UID entra no comando ou resposta. A operação exige e-mail confirmado, nascimento privado já registrado e elegibilidade review_required ou eligible. Não exige identityVerificationStatus verified.

O servidor deriva trustLevel basic ou verified do estado de identidade vigente. O cliente não envia esse nível nem status administrativos. FanProfile é persistido separado de Account e Identity, validado contra catálogo local fictício injetado no serviço. A criação é transacional, idempotente e limitada a cinco tentativas por conta/minuto. Edição ainda não existe.

O mobile implementa seis passos: boas-vindas e cultura de segurança, identidade de torcedor, intenções, abertura entre torcidas, poucos dados opcionais e revisão. O catálogo é explicitamente fictício e local. Não há fotos, perfil público, descoberta, swipe, interação, analytics ou provedor de identidade.

## Etapa 3.5 — fronteira de exposição pública

PublicProfileDTO é gerado somente por projectPublicProfile no servidor a partir de fontes privadas validadas. A função calcula idade, deriva selo, resolve nomes canônicos, aplica opt-ins e filtra fotos aprovadas; ela cria um objeto novo e o valida pelo contrato público estrito.

Nenhum endpoint para consultar perfis foi criado. Autorização por audiência, bloqueio e contexto deve envolver a projeção antes de futura descoberta. PublicProfileSettings representa apenas escolhas editáveis; trustLevel, selo, idade e estados administrativos não são aceitos do cliente.
