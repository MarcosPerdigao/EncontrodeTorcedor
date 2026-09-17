# Encontro de Torcedor

Plataforma nacional de conexões entre torcedores; Atlético Mineiro é o piloto. Etapas 0/1/1.5 aprovadas. Etapa 2: autenticação, sessão e conta somente em ambiente local. Etapa 3 exige nova autorização.

## Executar localmente

Node 22.21.1, npm 10+, Java 21 e Git. Sem login Firebase ou projeto real.

```sh
npm ci
npm run check
npm run build:mobile
npm run emulators
```

Em outro terminal, `npm start` para development build Expo. Android Emulator usa 10.0.2.2 para chegar ao loopback do computador; iOS Simulator usa 127.0.0.1. Dispositivo físico/rede pública não configurados. Use apenas contas sintéticas com domínio example.invalid. Auth Emulator exibe links locais para confirmar e-mail/recuperar acesso; esses logs são ignorados no Git e não devem conter dados reais.

Portas: Auth 9099, API 5001, Firestore 8080, Storage 9199, hub 4400, logs 4500. Bind em loopback. O app recusa autenticação fora de desenvolvimento; o backend recusa runtime não emulado. Nenhuma configuração de produção, segredo ou chave administrativa necessária.

## Fluxo entregue

Cadastro/login e recuperação Firebase Auth; confirmação de e-mail; estado da própria conta; registro privado e único de nascimento; saída com tentativa de revogação no servidor. Sessões e credenciais ficam só em memória. Reiniciar o app exige login. Nenhum CPF solicitado.

Uma declaração de 18+ não ativa a conta: elegibilidade fica em revisão até aferição futura. Menores ficam inelegíveis; não podem mudar nascimento para contornar a restrição. Perfil completo, fotos, descoberta e interações não foram implementados.

## Comandos

| Comando                       | Finalidade                                                                      |
| ----------------------------- | ------------------------------------------------------------------------------- |
| npm run check                 | Formato, lint, tipos, testes unitários/Rules/integração, build, scanner e audit |
| npm run test:unit             | Contratos, domínio, sessão e ferramentas                                        |
| npm run test:rules            | Somente Rules Firestore/Storage                                                 |
| npm run test:emulators        | Rules e integração Auth/API/Firestore/Functions                                 |
| npm run build                 | Compila contratos e backend                                                     |
| npm run build:mobile          | Exporta bundles Android/iOS; não é instalação nativa                            |
| npm run emulators             | Inicia serviços locais, após build                                              |
| npm start                     | Metro local                                                                     |
| npm run security:secrets      | Scanner de arquivos versionados/candidatos                                      |
| npm run security:dependencies | Audit bloqueando moderate ou superior                                           |

## Documentação

- [Estado vigente](docs/PROJECT_STATE.md)
- [Cartilha superior](docs/SAFETY_CHARTER.md)
- [Produto](docs/product.md), [arquitetura](docs/architecture.md), [dados](docs/data-model.md)
- [Autorização](docs/authorization.md), [ameaças](docs/threat-model.md), [retenção](docs/retention.md)
- [Perfil futuro](docs/PROFILE_MODEL.md), [compatibilidade conceitual](docs/MATCH_ENGINE.md), [roadmap](docs/ROADMAP.md)
- [Decisão de Auth/sessão](docs/decisions/0008-local-authentication-and-session-boundary.md)
- [Revisão da etapa 2](docs/stage-2-review.md)

## Limites

Firestore/Storage permanecem deny-all. Emuladores têm canais administrativos inseguros para internet; não os exponha. SDK Admin contorna Rules. Enumeração do provedor, App Check real, IAM, aferição de idade/identidade e retenção operacional exigem validação antes de qualquer ambiente real. Não confundir scanner por padrões com garantia absoluta.

O CLI Firebase local tem importadores JSON/Next Hosting desabilitados para remover dependência vulnerável; apenas emuladores documentados são suportados. Ver [ADR 0007](docs/decisions/0007-restricted-local-toolchain.md). No Windows, confira processos/portas após interrupção dos emuladores.

Ao concluir esta etapa, parar para revisão. Nenhum deploy ou merge automático em main.
