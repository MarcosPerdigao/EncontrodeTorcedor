# Modelo futuro de perfil
Documento conceitual; não implementa perfil, foto ou catálogo. A [cartilha](SAFETY_CHARTER.md) prevalece.

## Separação
Identidade privada: contato, nascimento e provas mínimas de elegibilidade. Perfil exibível: apelido, idade calculada no servidor, cidade selecionada, fotos derivadas aprovadas, bio e possível indicador mínimo de verificação. Indicador não revela documento, provedor, motivo ou evidência e não promete segurança da pessoa. O contrato público atual permanece mínimo; adicionar campos exige aprovação de allowlist e testes.

## Identidade futebolística
`fanProfile`: clubId do coração, intensidade da torcida, idolId, frequência em jogos/estádio, setor preferido, acompanha jogos fora, simpatias declaradas e clubPreferences. Dados opcionais de hábitos exigem minimização: não publicar agenda, localização atual, assento ou histórico recente preciso.

Entidades futuras:
- clubs: clubId, displayName, elementos culturais configuráveis e status.
- idols: idolId, displayName, clubIds, aliases e status.
- idolAliases: alias normalizado → idolId; resolução canônica e ambiguidades revisadas.
- decisões editoriais: motivo administrativo, evidência restrita, autor, revisão e timestamps; não saem no DTO.

Autocomplete parece livre ao digitar, mas retorna entidades canônicas. Ronaldinho, R10 e Ronaldinho Gaúcho ilustram aliases da mesma entidade, não seed autorizado. Sugestões novas passam por moderação; texto livre não é chave de analytics. Status active/under_review/ineligible conforme política editorial auditável.

## Intenções e abertura
Relacionamento, paquera/conhecer alguém, amizade, companhia para jogos e para eventos/rolês. Companhia para jogos é intenção; não implementa calendário ou presença em partidas.

Abertura: somente minha torcida, outras torcidas, rivais também, qualquer torcida ou clubes específicos. Sem classificação oficial de torcidas aliadas. Simpatia é escolha pessoal. A semântica de “rivais” requer definição transparente antes de implementar; preferências bilaterais e exclusões explícitas prevalecem.

## Além dos 90 minutos
Poucos campos opcionais: aproximadamente três estilos musicais, cinco hobbies, caseiro/equilibrado/rolezeiro, estilo de viagem e programa favorito. Filhos, desejo de filhos, pets, fuma e bebe são opcionais; avaliar finalidade e sensibilidade antes de coletar. Ausência de resposta não deve ser interpretada como resposta negativa.

Informação suficiente para gerar interesse e conversa, mas não para eliminar a descoberta entre as pessoas. Não transformar perfil em questionário excessivo. Preferências de filtro não são automaticamente atributos publicáveis.
