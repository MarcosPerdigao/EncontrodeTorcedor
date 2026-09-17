# ADR 0008 — Autenticação local e sessão da API

Status: implementado somente no ambiente local da etapa 2. Não autoriza ambiente real.

## Autenticação

Firebase Auth com e-mail/senha, confirmação e recuperação via SDK oficial. Optou-se pelo SDK JavaScript App/Auth no Expo para esta etapa local, com persistência exclusivamente em memória, sem AsyncStorage ou senha persistida pelo app. É ajuste à previsão inicial de avaliar RN Firebase: não elimina futura avaliação nativa de App Check e armazenamento seguro. Nenhum SDK Firestore/Storage é usado pelo app. Fonte: [Expo e Firebase](https://docs.expo.dev/guides/using-firebase/).

Google foi avaliado e não habilitado: não é necessário ao escopo inicial e exige configuração/credenciais e decisão de lançamento. Se adotado no iOS, reavaliar a seção 4.8 e Sign in with Apple antes de lançamento. [Regras da Apple](https://developer.apple.com/app-store/review/guidelines/#login-services).

## Fronteira local

Único project ID: demo-social-foundation, fictício, desenvolvimento emulado. Serviços: Auth, Functions, Firestore e Storage em loopback. Nenhum vínculo com projeto Firebase real; staging e produção não provisionados. Runtime exige flags/hosts exatos. App Check tem interface e adaptador somente local, sem token debug ou aprovação fictícia em ambiente real. A inicialização recusa ambiente não emulado, inclusive deploy real acidental.

Auth emulado aceita tokens sem assinatura criptográfica; seu canal administrativo não é proteção contra invasor local. Só fixtures artificiais e serviços nunca expostos à internet. [Auth Emulator](https://firebase.google.com/docs/emulator-suite/connect_auth).

## Sessões

O backend verifica ID token com revogação e consulta Auth vigente, inclusive disabled/emailVerified. Claims administrativas são ignoradas. Token de sessão da API aleatório de 256 bits, só memória no cliente; servidor guarda hash, auth_time, versão e expiração de uma hora. Não é identificador público de pessoa.

O documento de conta é consultado dentro de cada transação. Suspensão, banimento, exclusão em andamento e inelegibilidade bloqueiam todas as operações. Há proteção contra rebootstrap com a mesma autenticação após mudança de versão: linhagem por auth_time e corte authValidAfter. Revogação explícita incrementa versão e exige novo login com auth_time posterior ao corte. A operação exige autenticação de até cinco minutos. Rotina administrativa futura deverá atualizar versão e corte conjuntamente; não editar campos soltos em produção.

[Revogação Firebase](https://firebase.google.com/docs/auth/admin/manage-sessions). Nenhuma claim fornecida pelo cliente substitui o estado vigente.

## Conta e elegibilidade

Conta nasce pending, elegibilidade pending, verificação not_started. E-mail verificado permite registrar nascimento privado uma vez. Calendário UTC; aniversário de 29/02 ocorre em 01/03 em ano não bissexto, convenção conservadora sujeita à validação de produto/jurídica antes do lançamento. Idade inferior a 18 resulta em ineligible; idade declarada adulta resulta em review_required, nunca prova automática/conta ativa.

Nascimento não retorna na API e não pode ser alterado para contornar bloqueio. Correção requer processo futuro; não há API administrativa agora. IdentityVerificationProvider não recebe CPF; implementação não configurada sempre recusa. Nenhum endpoint de autoaprovação ou provedor falso em runtime.

## API

POST /session/bootstrap, /session/state, /account/complete e /session/revoke sob accountApi. Corpo estrito, identidade somente do token; UID extra é rejeitado. DTO allowlist de seis campos, sem dados privados. Bootstrap devolve também credencial opaca de sessão, exclusiva do titular. Não existe GET /users, CRUD genérico ou pesquisa.

Contadores transacionais por conta/operação/minuto: bootstrap 6, state 30, complete 5, revoke 5. Não há contador global. Os contadores são confirmados separadamente, inclusive quando uma tentativa autenticada com schema válido é recusada. Esses limites protegem as operações da API, não tentativas no Auth nem DDoS sem autenticação; controles do provedor/edge continuam requisito de ambiente real. Criação de conta é transacional; completar usa chave idempotente e nascimento imutável. Repetição de revogação não incrementa novamente após sessão invalidada.

Logs aceitam somente requestId gerado, operação enumerada, resultado categorizado e latência. Sem exceções/payloads, cabeçalhos ou identificadores pessoais.

## Enumeração e lançamento

Mensagens genéricas não resolvem enumeração no provedor. Integração mede EMAIL_EXISTS no Auth Emulator; não alegamos proteção equivalente em nuvem. A documentação informa que mesmo a proteção de enumeração não elimina essa resposta no cadastro. Antes de ambiente real: validar proteção de enumeração, fluxo de verificação antes do cadastro quando apropriado, App Check/reCAPTCHA e cotas; testar diferenças reais de login/cadastro/recuperação. Lançamento bloqueado enquanto isso estiver pendente. [Identity Platform](https://docs.cloud.google.com/identity-platform/docs/admin/email-enumeration-protection).

## Retenção e limites

Expiração técnica da sessão em uma hora não define retenção de mensagens. Sessões/contadores/recibos antigos não são automaticamente eliminados nesta base local; dados desaparecem ao encerrar emuladores sem export. Limpeza e retenção real devem ser aprovadas antes de persistência em nuvem. Não há exclusão de conta funcional nesta etapa; deixar tombstone/procedimentos incompletos seria enganoso.
