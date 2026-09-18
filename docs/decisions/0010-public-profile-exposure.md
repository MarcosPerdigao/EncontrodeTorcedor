# ADR 0010 — Exposição segura do perfil público

Status: aceito para a Etapa 3.5 em 18/09/2026.

## Contexto

Account, Identity e FanProfile contêm dados com finalidades e audiências distintas. Retornar uma entidade interna, remover campos por denylist ou aceitar um selo enviado pelo cliente permite vazamentos quando o modelo evolui. O perfil público precisa gerar contexto para conversa sem revelar identidade civil, localização precisa ou funcionamento interno.

## Decisão

PublicProfileDTO é uma allowlist independente e estrita, produzida somente por uma função de projeção no servidor. A projeção recebe fontes privadas já autorizadas e constrói um novo objeto; não usa spread de documentos internos.

Campos públicos: referência opaca, displayName escolhido como primeiro nome ou apelido de um único termo, idade calculada, cidade canônica ampla, bio de até 160 caracteres, fotos aprovadas por referência opaca, selo verified opcional, identidade futebolística canônica e lifestyle/intenções somente quando a pessoa optou por exibir.

O cliente pode editar apenas PublicProfileSettings. Não pode enviar verificationBadge, trustLevel, idade, status administrativos, IDs de catálogo exibidos ou referências de fotos. Cidade é escolhida por ID canônico e projetada como rótulo; bairro, endereço, distância, coordenadas e GPS permanecem ausentes.

## Fotos

PhotoReference é entidade interna conceitual com photoId, ownerAccountRef, status, ordering e moderationStatus. Somente owner correto, status ready e moderação approved viram PublicPhotoDTO com photoRef opaca e order. Não há upload, bucket público, URL ou abertura de Storage nesta etapa.

## Conteúdo proibido

Bio e displayName recusam contatos, URLs e handles externos. CPF, UID, nascimento, e-mail, telefone, tokens, claims, status editoriais/moderação, caminhos de Storage, localização precisa e histórico detalhado de jogos nunca pertencem ao DTO.

## Consequências e riscos

A projeção reduz vazamento acidental, mas não substitui autorização, bloqueio, audiência nem mitigação de scraping. Uma referência opaca não concede acesso. Validação textual é conservadora e não substitui moderação futura; pode produzir falso positivo e exige evolução versionada. Nome de um único termo reduz risco de sobrenome, com limitações culturais a revisar antes do lançamento.
