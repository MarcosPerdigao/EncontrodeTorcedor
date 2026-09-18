# Estado do projeto

Última atualização: 18/09/2026. Branch: codex/discovery-safety-boundary. Base aprovada: 40dfb9a.

## Visão

Plataforma nacional de conexões entre torcedores. Atlético Mineiro é somente a comunidade piloto. Clubes e cultura configuráveis, sem feed, seguidores ou acoplamento técnico à torcida.

## Etapas

Etapas 0, 1, 1.5, 2, 2.5, 3, 3.5 e 4 concluídas e aprovadas. Etapa 4.5 autorizada, ainda não iniciada. Etapa 5 não está autorizada.

## Entregue na Etapa 2

E-mail/senha, confirmação/recuperação local Firebase Auth; sessão volátil do app e sessão lógica da API; conta com estados explícitos; nascimento privado e cálculo de idade; referência opaca e DTO estrito; abstração de identidade sem provedor real; autorização transacional, limites por ator/operação e logger por allowlist.

API local: bootstrap, estado próprio, completar nascimento e revogar sessões. Conta suspensa, banida, inelegível ou em exclusão perde acesso mesmo com token Firebase válido. Claims não substituem estado vigente. Nenhum UID ou nascimento no DTO. CPF não integra modelo, persistência, fluxo ou provedor abstrato.

## Entregue na Etapa 2.5

Domínio multiclube com Club e Idol canônicos, aliases não ambíguos e status editoriais; FanProfile separado da conta; preferências de clube e conexão autodeclaradas; intenções múltiplas; LifestyleProfile opcional e minimizado. Referências são validadas contra catálogo ativo fornecido ao parser. Fixtures são integralmente fictícias. Não há endpoint, persistência, tela, catálogo real, descoberta, score, foto, interação ou analytics.

Ver modelo do torcedor em FAN_DOMAIN_MODEL.md, entradas futuras do motor em MATCH_ENGINE_INPUTS.md, ADR 0011 e revisão da Etapa 2.5.

## Entregue na Etapa 3

Confiança progressiva conforme ADR 0009; trustLevel derivado; criação transacional e idempotente de FanDomain pela API local; catálogo fictício injetado; fluxo mobile de seis passos com revisão de privacidade e cultura de segurança. Conta básica cria perfil com identidade not_started, sem CPF. Verificação posterior não altera o perfil.

Firestore/Storage seguem fechados ao cliente. Não existem fotos, perfil público ampliado, descoberta, swipe, likes, match, chat, algoritmo, analytics, moderação automática ou ambiente real.

## Entregue na Etapa 3.5

PublicProfileDTO por allowlist; PublicProfileSettings com autoridade limitada; idade e selo derivados; projeção canônica de clube/ídolos; lifestyle e intenções sob opt-in; PhotoReference interno e filtro de fotos aprovadas. Nenhum endpoint público, upload, Storage aberto ou descoberta foi criado. Ver PUBLIC_PROFILE_MODEL.md, ADR 0010 e stage-3.5-review.md.

## Entregue na Etapa 4

TrustLevel derivado no servidor; contratos estritos de contexto, regra, elegibilidade e interação; matriz de audiência sem algoritmo; bloqueio bidirecional; estados bloqueantes; exigência opcional de verificação para interação; cota diária finita. Basic→basic permanece pendente e negado por padrão. Nenhum endpoint, candidato, card ou ação social foi criado. Ver DISCOVERY_AUDIENCE_RULES.md, ADR 0012 e stage-4-review.md.

## Decisões preservadas

Cartilha superior de segurança; Rules Firestore/Storage deny-all inclusive signals; somente fixtures sintéticas; sem localização precisa; jogos fora do MVP; retenção de mensagens não aprovada. Uma declaração de idade adulta resulta em revisão pendente, não conta verificada. A confiança progressiva permite perfil básico sem identidade verificada; identidade/idade definitivas dependem de mecanismo posterior validado. CPF permanece fora do fluxo.

## Evidência local

451 testes aprovados: 213 unitários, 211 Rules, 27 integração. npm run check com saída 0; lint, TypeScript strict, formato e builds aprovados. Scanner: 115 arquivos, 0 ocorrências. Auditoria: 0 vulnerabilidades conhecidas. Exportação Android/iOS e compatibilidade Expo aprovadas. Nenhum teste em dispositivo físico ou infraestrutura Firebase real foi alegado.

## Evidência remota

GitHub Actions [35301636217](https://github.com/MarcosPerdigao/EncontrodeTorcedor/actions/runs/35301636217) aprovado em 18/09/2026; job `verify` em 1min52s. Passaram instalação reproduzível, scanner, formato, lint, TypeScript strict, 368 testes, builds, auditoria, compatibilidade Expo e exportação Android/iOS. Nenhum deploy ou ambiente Firebase real integra o workflow.

Avisos não bloqueantes: actions fixadas por SHA ainda miram runtime Node 20 e foram executadas pelo GitHub em Node 24; `ubuntu-latest` migrará para Ubuntu 26 em outubro de 2026. Exigem manutenção futura e nova validação, sem alterar o resultado desta execução.

## Decisão de confiança progressiva

ADR 0009: identityVerificationStatus começa em not_started. Conta básica pode criar perfil após e-mail confirmado e declaração adulta em revisão, sem CPF e sem alterar estados administrativos. trustLevel é projeção derivada no servidor; verificação futura não modifica a identidade do torcedor. Conta suspensa, banida, inelegível ou em exclusão continua sem acesso.

## Riscos e decisões pendentes

Política basic→basic, valores e persistência transacional das cotas, enumeração no cadastro Firebase (EMAIL_EXISTS), controles de abuso do provedor/edge, App Check nativo, persistência segura de sessão em dispositivo, aferição de idade/identidade, processo de correção do nascimento e exclusão, retenção/limpeza operacional, políticas de moderação e editoriais. Antes de qualquer ambiente real, esses controles e testes exigem revisão. Runtime atual recusa configuração não emulada.

Google não habilitado; se adotado no iOS, avaliar Sign in with Apple/regras de login. SDK JS App/Auth e sessões em memória são escolha desta fase local; ver ADR 0008. Convenção de aniversário em 29/02: 01/03 no ano não bissexto, sujeita a validação antes do lançamento.

## Versões futuras

V1 perfil público possui contrato/projeção, mas conexões e interações ainda não foram implementadas; V2 Passaporte; V3 Dia de Jogo; V4 aprimoramento de compatibilidade; V5 gamificação saudável. Ver ROADMAP. Esses itens não estão autorizados para implementação agora.

## GitHub e processo

Repositório observado como público; nenhuma visibilidade, ruleset ou configuração administrativa alterada. Recomendações permanecem: avaliar privacidade, proteger main, exigir CI e impedir force push. Trabalho em branch separada, commits pequenos e sem merge automático. A autorização de executar CI da etapa 2 é atendida publicando somente a branch de revisão, sem deploy.

## Registros

- [Etapa 1.5 e seus commits](stage-1.5-review.md): 8867724, 6e7d991, 5ae6bf8, 6502357, 8914601; publicação registrada em eff5825.
- Etapa 2 publicada: 09dc2ca (modelos/contratos), aa96138 (API/sessão), 9e991d3 (mobile), 0b4138b (testes/CI), e2616b0 (revisão/limites). O registro do resultado remoto é um commit documental posterior.
- [Revisão da etapa 2](stage-2-review.md), [ADR 0008](decisions/0008-local-authentication-and-session-boundary.md).
- Etapa 2.5: 71ea170, 7db948d, 5e8fbdf e fbe25c9.
- Etapa 3 aprovada: 3712595, 28ae668, bb6fc9b, 0ed79d1, 82165e0 e 07a834b.
- Etapa 3.5 aprovada: ab68d77, 51ed3df, e092b97, 4c618f2 e 40dfb9a.
- Etapa 4 aprovada: f9390fe (princípios), 284f3d0 (contratos), c5d1a0d (fronteira), 3717fe6 (testes) e 7e49cb6 (revisão).

Etapa 4 concluída e aprovada. Etapa 4.5 autorizada somente para DiscoveryCard, projeção pública, filtros e apresentação; algoritmo, score, ranking, recomendação, swipe, likes, match e chat continuam proibidos.
