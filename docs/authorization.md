# Autorização

## Política efetiva da fundação

| Recurso                                                    | Anônimo | Autenticado | Custom claims user/moderator/admin |
| ---------------------------------------------------------- | ------- | ----------- | ---------------------------------- |
| Todo documento Firestore: get/list/create/update/delete    | Negado  | Negado      | Negado                             |
| signals/{uid}, inclusive documento próprio                 | Negado  | Negado      | Negado                             |
| Todo objeto Storage: leitura/listagem/upload/update/delete | Negado  | Negado      | Negado                             |
| Caminho desconhecido/nested/collection group               | Negado  | Negado      | Negado                             |

Na etapa 2 somente accountApi é exportado, exclusivamente para emuladores: bootstrap, estado próprio, completar nascimento privado e revogar sessões. Suspensos, banidos, inelegíveis e contas em exclusão perdem acesso mesmo com token válido. Não há exceção temporária para desenvolvimento. As Rules fechadas não bloqueiam Admin SDK/IAM privilegiado: credenciais de serviço são uma fronteira separada. Bypass nos testes existe **apenas** no emulador para semear fixtures, nunca em uma regra ou API.

## Matriz planejada para a API futura

| Recurso                     | Lê                                               | Cria                         | Altera                                        | Exclui                                    |
| --------------------------- | ------------------------------------------------ | ---------------------------- | --------------------------------------------- | ----------------------------------------- |
| Identidade privada          | Titular/serviço com finalidade                   | Cadastro servidor            | Titular em campos permitidos/serviço          | Processo de exclusão                      |
| Perfil                      | Titular/audiência elegível sem bloqueio, por DTO | Titular via API              | Titular em allowlist; moderação altera status | Processo autorizado                       |
| Preferências/consentimentos | Titular/serviço necessário                       | Titular via API              | Titular; revogação como registro              | Política de retenção                      |
| Foto                        | Dono/audiência autorizada após aprovação         | Dono com autorização         | Processamento/moderação                       | Dono via API/serviço                      |
| Like/pass                   | Autor quando necessário/servidor                 | Autor via API                | Transições permitidas                         | Expiração/exclusão                        |
| Match                       | Participantes autorizados                        | Servidor                     | Servidor; participante solicita encerramento  | Serviço                                   |
| Mensagem                    | Participantes autorizados                        | Participante via API         | Sem edição no MVP                             | Retenção/exclusão definida posteriormente |
| Bloqueio                    | Autor do bloqueio/servidor                       | Participante via API         | Autor solicita desbloqueio                    | Serviço após comando válido               |
| Denúncia/evidência          | Moderação com escopo                             | Usuário via API/servidor     | Moderação                                     | Política de retenção                      |
| Protocolo de denúncia       | Denunciante                                      | Servidor                     | Servidor                                      | Serviço                                   |
| Papel administrativo        | Gestão autorizada                                | Provisionamento privilegiado | Gestão autorizada                             | Gestão autorizada                         |
| Auditoria                   | Auditoria/segurança                              | Servidor                     | Não editável pelo operador auditado           | Política de retenção                      |

Toda API futura deriva o ator do token validado; verifica estado atual da conta, versão de sessão, elegibilidade, relação com objeto e bloqueios nas duas direções; valida schema, tamanho, cotas e idempotência. Negar por padrão transições não reconhecidas. DTOs têm allowlists. Identificadores opacos não substituem autorização.

Não abrir Rules com custom claim admin: painel separado usa API com MFA, escopo e auditoria. Claims antigas não mantêm acesso revogado: validar estado vigente da equipe. Nenhuma permissão de moderador inclui navegar livremente nas conversas.

## Evidência exigida

Testes com o SDK cliente e emuladores reais devem distinguir permission-denied de falha de rede. Testar dados existentes e inexistentes, documento próprio/alheio, listas e collection groups, escritas individuais/lotes, desconhecidos e claims privilegiadas. Validar todas as operações Storage, inclusive listagem, metadata e download. Um controle com bypass de Rules deve comprovar que fixtures existem e os serviços estão funcionando.

O contrato fechado das regras terá teste estático exato adicional: qualquer mudança de política exige atualização revisada. Teste textual não substitui execução no emulador.

## Etapa 2 — autorização implementada localmente

Identidade do token, conta vigente, sessionVersion, elegibilidade, schema, operação, limites e idempotência são avaliados no servidor. Estado próprio mínimo pode ser consultado antes da conclusão de elegibilidade; ações protegidas exigem todos os gates. Suspensos/banidos não executam mutações. Claims não substituem estado vigente. Cliente não pode enviar UID como autoridade nem editar estados. Nenhum endpoint lista usuários.

## Perfil básico na Etapa 3

fan-profile/create exige token Firebase vigente, sessão da API pertencente ao mesmo ator, conta acessível, e-mail confirmado, identidade privada já criada e declaração adulta em review_required ou eligible. Conta suspensa, banida, inelegível, excluída ou em exclusão falha antes da operação. identityVerificationStatus not_started é permitido para esta única capacidade básica.

O comando é estrito e não aceita UID, accountRef, CPF, nascimento, contato, trustLevel, status de identidade/conta/elegibilidade ou papéis. Referências de clube e ídolo precisam existir e estar ativas no catálogo injetado. O cliente nunca escolhe o caminho do documento. Firestore e Storage permanecem deny-all para qualquer SDK cliente.

## Exposição futura do perfil

A Etapa 3.5 implementa somente contrato e projeção pura. Não existe rota para ler perfil próprio ou alheio. Uma futura operação deve verificar conta vigente, audiência, bloqueio em ambas as direções e contexto antes de projetar. PublicProfileDTO não concede autorização por si só e profileRef opaca não é capability.

O cliente pode propor apenas displayName, cityId, bio e opt-ins pelo schema PublicProfileSettings. Selo, idade, trustLevel, estado administrativo e foto/moderação vêm de fontes internas.

## Audiência da Etapa 4

Visualização e interação possuem decisões separadas. evaluateAudience deriva confiança do estado interno; nenhum request pode fornecer trustLevel, bloqueio, restrição ou saldo de cota. Estado indisponível e bloqueio são avaliados antes de qualquer perfil público.

Verified não ignora bloqueio nem limite. Basic pode visualizar verified, mas uma exigência do alvo pode impedir o início de interação até verificação. Basic→basic permanece negado por padrão enquanto a política estiver pendente. Não existe rota de descoberta nesta etapa.

## DiscoveryCard da Etapa 4.5

DiscoveryCard não é capability. Sua projeção só pode ocorrer depois de uma decisão vigente de audiência e utiliza exclusivamente PublicProfileDTO. Reabrir perfil completo ou usar mídia exige nova autorização adequada ao recurso.

DiscoveryCardPresentation é configuração do servidor. DiscoveryFilters pode futuramente ser entrada estrita do cliente, mas nunca fornece trustLevel, identidade do alvo, bloqueio, score ou autoridade de ordenação.

## Afinidade da Etapa 5

`AffinityExplanation` não concede acesso nem substitui autorização. O servidor deve produzir a audiência antes do motor; somente `canView: true` com motivo `eligible` é aceito. Decisões negativas geram falha genérica, sem revelar bloqueio, suspensão ou estado privado.

O cliente não envia confiança, estado de conta, bloqueio ou contexto arbitrário como autoridade. Não existe endpoint nesta etapa. Uma integração futura deverá carregar perfis públicos vigentes, revalidar audiência no mesmo fluxo e aplicar limites contra enumeração antes de devolver qualquer explicação.
