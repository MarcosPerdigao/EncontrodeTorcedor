# Estado do projeto

Última atualização: 17/09/2026. Branch: `codex/stage-2-auth-identity`. Base aprovada: `eff5825`. Último commit funcional/de testes: `0b4138b`.

## Visão

Plataforma nacional de conexões entre torcedores. Atlético Mineiro é somente a comunidade piloto. Clubes e cultura configuráveis, sem feed, seguidores ou acoplamento técnico à torcida.

## Etapas

0, 1 e 1.5 concluídas e aprovadas; CI remoto da 1.5 aprovado. Etapa 2 expressamente autorizada após revisão intermediária: implementação local concluída, aguardando validação do CI remoto e revisão final. Etapa 3 não autorizada. Nenhum perfil completo, foto, descoberta, ranking, interação, chat ou catálogo real implementado.

## Entregue na Etapa 2

E-mail/senha, confirmação/recuperação local Firebase Auth; sessão volátil do app e sessão lógica da API; conta com estados explícitos; nascimento privado e cálculo de idade; referência opaca e DTO estrito; abstração de identidade sem provedor real; autorização transacional, limites por ator/operação e logger por allowlist.

API local: bootstrap, estado próprio, completar nascimento e revogar sessões. Conta suspensa, banida, inelegível ou em exclusão perde acesso mesmo com token Firebase válido. Claims não substituem estado vigente. Nenhum UID ou nascimento no DTO. CPF não integra modelo, persistência, fluxo ou provedor abstrato.

## Decisões preservadas

Cartilha superior de segurança; Rules Firestore/Storage deny-all inclusive signals; somente fixtures sintéticas; sem localização precisa; jogos fora do MVP; retenção de mensagens não aprovada. Uma declaração de idade adulta resulta em revisão pendente, não conta ativa. Identidade/idade definitivas dependem de mecanismo posterior validado.

## Evidência local

368 testes aprovados: 132 unitários, 211 Rules, 25 integração. npm run check com saída 0; lint, TypeScript strict, formato, build e scanner aprovados. Auditoria: 0 vulnerabilidades conhecidas. Exportação Android/iOS e compatibilidade Expo aprovadas. Nenhum teste em dispositivo físico ou infraestrutura Firebase real foi alegado.

## Riscos e decisões pendentes

Enumeração no cadastro Firebase (EMAIL_EXISTS), controles de abuso do provedor/edge, App Check nativo, persistência segura de sessão em dispositivo, aferição de idade/identidade, processo de correção do nascimento e exclusão, retenção/limpeza operacional, políticas de moderação e editoriais. Antes de qualquer ambiente real, esses controles e testes exigem revisão. Runtime atual recusa configuração não emulada.

Google não habilitado; se adotado no iOS, avaliar Sign in with Apple/regras de login. SDK JS App/Auth e sessões em memória são escolha desta fase local; ver ADR 0008. Convenção de aniversário em 29/02: 01/03 no ano não bissexto, sujeita a validação antes do lançamento.

## Versões futuras

V1 conexões, segurança, perfil e interações ainda não implementadas; V2 Passaporte; V3 Dia de Jogo; V4 aprimoramento de compatibilidade; V5 gamificação saudável. Ver ROADMAP. Esses itens não estão autorizados para implementação agora.

## GitHub e processo

Repositório observado como público; nenhuma visibilidade, ruleset ou configuração administrativa alterada. Recomendações permanecem: avaliar privacidade, proteger main, exigir CI e impedir force push. Trabalho em branch separada, commits pequenos e sem merge automático. A autorização de executar CI da etapa 2 é atendida publicando somente a branch de revisão, sem deploy.

## Registros

- [Etapa 1.5 e seus commits](stage-1.5-review.md): 8867724, 6e7d991, 5ae6bf8, 6502357, 8914601; publicação registrada em eff5825.
- Etapa 2: 09dc2ca (modelos/contratos), aa96138 (API/sessão), 9e991d3 (mobile), 0b4138b (testes/CI).
- [Revisão da etapa 2](stage-2-review.md), [ADR 0008](decisions/0008-local-authentication-and-session-boundary.md).

Ao concluir a validação remota: PARAR e aguardar revisão. Não avançar para etapa 3.
