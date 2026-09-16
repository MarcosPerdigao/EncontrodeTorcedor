# Autorização

## Política efetiva da fundação

| Recurso                                                    | Anônimo | Autenticado | Custom claims user/moderator/admin |
| ---------------------------------------------------------- | ------- | ----------- | ---------------------------------- |
| Todo documento Firestore: get/list/create/update/delete    | Negado  | Negado      | Negado                             |
| signals/{uid}, inclusive documento próprio                 | Negado  | Negado      | Negado                             |
| Todo objeto Storage: leitura/listagem/upload/update/delete | Negado  | Negado      | Negado                             |
| Caminho desconhecido/nested/collection group               | Negado  | Negado      | Negado                             |

Nenhum endpoint é exportado. Não há exceção temporária para desenvolvimento. As Rules fechadas não bloqueiam Admin SDK/IAM privilegiado: credenciais de serviço são uma fronteira separada. Bypass nos testes existe **apenas** no emulador para semear fixtures, nunca em uma regra ou API.

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
