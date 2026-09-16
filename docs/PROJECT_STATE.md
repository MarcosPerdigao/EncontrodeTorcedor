# Estado do projeto
Última atualização: 16/09/2026. Commit de referência da fundação: `536fedd`. Branch de trabalho: `codex/auth-identity-foundation`.

## Visão
Plataforma nacional de conexões entre torcedores: a paixão pelo clube funciona como identidade social e cada torcida possui seu universo cultural dentro da mesma plataforma. Atlético Mineiro é somente a comunidade piloto. Não é rede social, feed, plataforma de seguidores/influência, clone de Tinder ou aplicativo exclusivamente de namoro.

## Etapas
Etapas 0 e 1 concluídas. Etapa 1.5 em execução: sincronização documental e revisão cruzada, seguida de todos os testes existentes. Etapa 2 autorizada somente após esse checkpoint. Etapa 3 e funcionalidades posteriores não autorizadas.

## Decisões aprovadas
- Segurança e privacidade prevalecem sobre engajamento; [cartilha](SAFETY_CHARTER.md) é regra superior de produto.
- Uma arquitetura multiclube, sem tipos ou regras acoplados ao piloto; catálogos configuráveis.
- API mediando negócio; Firestore/Storage deny-all, inclusive signals e claims administrativas.
- Apenas fixtures sintéticas, referências opacas e DTOs por allowlist; sem UID alheio, CPF ou nascimento público.
- Jogos e localização precisa fora do MVP; nenhum GPS/background.
- Etapa 2: Firebase Auth e-mail/senha, conta, sessão e abstração de identidade, sem provedor real ou CPF armazenado.
- Retenção de mensagens não aprovada; 180 dias permanece hipótese.
- Nenhuma produção ou alteração administrativa do GitHub autorizada.

## Versões
V1: segurança, identidade, perfil, preferências, descoberta, compatibilidade, like/pass, match, chat, bloqueio, denúncias, moderação e privacidade. V2: Passaporte do Torcedor. V3: Dia de Jogo. V4: aprimorar compatibilidade. V5: gamificação saudável. Ver [roadmap](ROADMAP.md); pertencer ao roadmap não autoriza implementar.

## Pendências e bloqueios
Provedor e mecanismo de aferição de idade/identidade, política editorial de ídolos, critérios operacionais de denúncias procedentes, retenção, Google/Apple, ambiente Firebase real, App Check nativo e políticas de lançamento precisam de validação específica. Perfil, fotos, catálogos reais e todas as interações estão bloqueados pelo escopo atual.

## Riscos
Enumeração no provedor Auth, roubo de sessão, abuso administrativo, cliente manipulado, stalking entre torcidas, brigading, exposição de preferências e reidentificação de analytics. Emuladores não comprovam segurança de infraestrutura real. Ver threat-model e revisão da fundação.

## Processo
Atualizar este documento ao concluir cada etapa relevante, com evidência, pendências e commit de referência. Recomendar proteção de main, CI obrigatório, bloqueio de force push e PRs. Avaliar privacidade do repositório antes de avançar em implementação proprietária; se já privado, manter. Não alterar visibilidade ou regras administrativas automaticamente.
