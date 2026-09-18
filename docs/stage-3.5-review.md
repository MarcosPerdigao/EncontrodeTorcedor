# Revisão da Etapa 3.5 — Perfil Público e Segurança de Exposição

Estado: concluída e aprovada; usada como base da Etapa 4.

## Resultado

PublicProfileDTO foi substituído por uma allowlist alinhada ao produto. A projeção no servidor calcula idade, deriva verificationBadge, resolve clube/ídolos canônicos, aplica opt-in a lifestyle/intenções e seleciona somente fotos do proprietário em estado ready e moderação approved.

Não há endpoint público, descoberta ou leitura de perfil alheio. A projeção é uma fronteira pura para uso futuro após autorização, bloqueio e audiência.

## Informações públicas

Referência opaca, displayName de um termo, idade calculada, cidade canônica ampla, fotos opacas aprovadas, bio opcional de até 160 caracteres, selo verified opcional, clube/nome curto, intensidade, ídolos canônicos, experiência ampla de estádio e lifestyle/intenções opcionais.

## Informações excluídas

CPF, UID, accountRef, nascimento, contato, token, claims, trustLevel, estados administrativos, status editorial/moderação, caminho de Storage, localização precisa, distância, bairro, endereço, preferências privadas, jogos/datas/estádios recentes e redes externas.

## Arquivos criados

- docs/PUBLIC_PROFILE_MODEL.md
- docs/decisions/0010-public-profile-exposure.md
- docs/stage-3.5-review.md
- functions/src/domain/photo-reference.ts
- functions/src/domain/public-profile-projection.ts
- tests/unit/public-profile-projection.test.ts

## Arquivos alterados

- packages/contracts/src/public-profile.ts
- packages/contracts/src/index.ts
- packages/contracts/tests/public-profile.test.ts
- docs/PROFILE_MODEL.md
- docs/PROJECT_STATE.md
- docs/architecture.md
- docs/authorization.md
- docs/data-model.md
- docs/security-principles.md
- docs/threat-model.md
- docs/stage-2.5-review.md
- docs/stage-3-review.md

## Arquivo renumerado

- docs/decisions/0010-canonical-fan-domain-catalogs.md passou a 0011-canonical-fan-domain-catalogs.md para reservar o ADR 0010 solicitado para exposição pública.

## Decisões

- DTO público independente, estrito e sem spread de entidades.
- Primeiro nome/apelido limitado a um termo; limitação cultural pendente de validação.
- Cidade somente por catálogo amplo.
- Bio conservadora sem contato, URL, handle ou rede social.
- Conta básica não recebe rótulo negativo; selo existe apenas para verified.
- PhotoReference permanece interno; PublicPhotoDTO expõe somente referência opaca e ordem.
- Nenhum upload, URL, Storage público, endpoint de perfil ou descoberta.

## Testes

O checkpoint completo `npm run check` terminou com código 0: 189 testes unitários, 211 testes de Rules e 27 testes de integração, totalizando 427. Os 69 testes focados nos contratos e na projeção pública passaram. Formato, lint, TypeScript strict, builds, scanner de 107 arquivos sem ocorrências e auditoria sem vulnerabilidades também passaram. A compatibilidade Expo e as exportações Android/iOS foram aprovadas. O runtime de Rules ainda emite o aviso conhecido ao encerrar, depois da aprovação dos testes, sem alterar o código de saída.

## Riscos residuais

- Autorização por audiência e bloqueio ainda não implementada.
- Filtros textuais não substituem moderação e podem ter falsos positivos/evasões.
- DisplayName de um termo exige revisão cultural e de acessibilidade.
- Catálogo real de cidades e governança pendentes.
- Upload, processamento, cache e revogação de fotos pendentes.
- Scraping, correlação e inferência precisam de cotas e testes antes da descoberta.
- Selo verified não pode ser comunicado como garantia de segurança.
