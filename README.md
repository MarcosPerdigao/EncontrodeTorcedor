# Projeto Match Alvinegro — fundação

Base de um aplicativo independente para conexões entre torcedores adultos. Somente etapas 0 e 1 autorizadas: documentação, ferramentas, contratos e regras fechadas. Não há autenticação, perfil funcional, descoberta, match, chat ou endpoint.

## Começar

Requisitos: Node 22.21.1 (ver `.nvmrc`), npm 10+, Java 21, Git. Não precisa de login Firebase, projeto real ou service account. Apenas fixtures sintéticas.

```sh
npm ci
npm run check
npm run build:mobile
```

O primeiro teste baixa os binários oficiais dos emuladores. Reserve as portas locais 8080, 9199, 4400 e 4500. O executor fixa `demo-social-foundation` e recusa variáveis com projeto real/credenciais explícitas. Firestore e Storage negam todo acesso cliente.

## Comandos

| Comando                            | Finalidade                                                      |
| ---------------------------------- | --------------------------------------------------------------- |
| npm run lint                       | ESLint, sem avisos                                              |
| npm run typecheck                  | TypeScript strict em ferramentas, contratos, mobile e functions |
| npm run format:check               | Prettier                                                        |
| npm run test:unit                  | Contratos, política e ferramentas de segurança                  |
| npm run test:rules                 | Inicia emuladores, testa autorização e encerra                  |
| npm test                           | Todos os testes                                                 |
| npm run build                      | Compila contratos e base de Functions                           |
| npm run build:mobile               | Exporta bundles Android/iOS; não é build nativo                 |
| npm run security:secrets           | Padrões de secrets nos arquivos Git/candidatos                  |
| npm run security:dependencies      | npm audit, bloqueia moderate ou superior                        |
| npm run check                      | Todas as verificações acima, exceto export mobile               |
| npm run build && npm run emulators | Emuladores locais incluindo base vazia de Functions             |
| npm start                          | Metro local para development build; app deliberadamente vazio   |

Development builds são o caminho previsto para integração nativa. Nenhuma credencial, projeto EAS ou binário nativo é criado nesta etapa. Expo Go não é critério de validação. O app sem telas apenas comprova que a fundação pode ser empacotada.

## Documentação

- [Produto e escopo](docs/product.md)
- [Arquitetura](docs/architecture.md)
- [Dados](docs/data-model.md)
- [Autorização](docs/authorization.md)
- [Threat model](docs/threat-model.md)
- [Retenção pendente](docs/retention.md)
- [Princípios de segurança](docs/security-principles.md)
- [ADRs](docs/decisions/)
- [Desenvolvimento e ambientes](docs/development.md)

## Limites

Produção e staging não provisionados. Não há deploy no CI. Rules não controlam Admin SDK/IAM. Emuladores têm interfaces administrativas sem autenticação e nunca devem ser expostos à rede pública. O scanner de secrets é defesa por padrões conhecidos, não garantia matemática; revisar diffs e acessos continua obrigatório.

Após esta fundação, aguardar autorização antes da etapa 2.

## Restrição da ferramenta Firebase

O Firebase CLI deste workspace é destinado aos emuladores documentados. Pipelines de importação JSON de Auth/Realtime Database e processamento Next Hosting foram desabilitadas para remover uma dependência vulnerável incompatível com a API corrigida. Não usar esta instalação para importação/deploy. A auditoria continua obrigatória, sem allowlist de advisories. Veja [ADR 0007](docs/decisions/0007-restricted-local-toolchain.md).
