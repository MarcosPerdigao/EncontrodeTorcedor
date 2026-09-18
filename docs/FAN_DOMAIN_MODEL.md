# Modelo de domínio do torcedor

## Propósito e fronteiras

A plataforma é nacional e multiclube. O clube piloto é configuração de produto, não tipo, collection ou regra especial. Esta etapa define contratos puros; não cria endpoint, persistência, interface, catálogo real, perfil público, descoberta ou algoritmo.

As fronteiras permanecem independentes:

- Account: autenticação, sessão, estado e elegibilidade.
- Identity: nascimento e futuras provas privadas.
- FanProfile: relação declarada da pessoa com futebol.
- LifestyleProfile: poucos interesses pessoais opcionais.
- PublicProfileDTO: projeção futura por allowlist, separada do agregado.
- Club e Idol: entidades editoriais canônicas.

Nenhum contrato do torcedor aceita UID, CPF, nascimento, contato, claims, estado administrativo ou localização precisa.

## Catálogos canônicos

Club possui ID opaco, nome, nome curto, aliases, país, região ampla opcional, status e timestamps. Os estados são active, inactive e under_review. Somente clube ativo pode ser referenciado por perfil ou preferência.

Idol possui ID opaco, nome canônico, aliases, clubes relacionados, status e timestamps. Estados editoriais: active, under_review, ineligible e retired. Somente entidade ativa pode ser escolhida. Alias é normalizado apenas para busca; o vínculo salvo é sempre idolId. Colisão entre aliases de entidades diferentes invalida o catálogo. Decisões editoriais reais precisarão de trilha de auditoria e processo de revisão; não existe lista proibida em código.

As fixtures usam exclusivamente Clube Horizonte, União das Estrelas, Alex da Serra e Beto do Vale, todos fictícios.

## FanProfile

Campos:

- fanProfileRef: referência opaca do domínio.
- primaryClubId: clube principal ativo.
- intensity: when_possible, frequent_follower, part_of_routine ou central_to_life.
- favoriteIdolIds: até cinco entidades ativas vinculadas ao clube principal.
- stadiumExperience: presença, frequência, setor amplo e viagens, todos opcionais salvo a declaração de presença quando o objeto existe.
- supporterHistory: texto opcional sobre início da torcida e partida memorável; não é histórico estruturado.
- clubPreferences: relações autodeclaradas supporter, sympathizer ou open_to_connection.

O domínio não classifica alianças nem rivalidades. self_declared_rivals significa apenas abertura declarada pela própria pessoa.

## Intenção e preferência de conexão

Uma ou mais intenções são exigidas: relacionamento, conhecer alguém, amizade, companhia para jogos e companhia para eventos. Preferências aceitam mesma torcida, outras torcidas, rivais autodeclarados e clubes específicos. Seleções específicas precisam existir no catálogo ativo.

Esses campos são entradas disponíveis, não lógica de descoberta. Bloqueio, elegibilidade e autorização continuam superiores a qualquer preferência.

## Além dos 90 minutos

LifestyleProfile é integralmente opcional. Música aceita até três itens e hobbies até cinco. Estilo de vida, viagem, pets, filhos, fumo e álcool usam enums pequenos. Ausência não equivale a resposta negativa. Finalidade, sensibilidade e audiência de cada campo devem ser revistas antes de uma projeção pública.

## Analytics futuro

IDs canônicos permitem contar distribuição por clube, ídolos e interesses sem depender de texto livre. Nenhum evento, agregado, pipeline ou tracking foi criado. Analytics futuro deve minimizar dados, suprimir grupos pequenos e separar telemetria de auditoria.

## Decisões adiadas e riscos

- Governança editorial, autoria, motivo, revisão e contestação de catálogo.
- Catálogo nacional real e fontes licenciadas.
- Semântica de retired e política de disponibilidade em produção.
- Visibilidade de cada atributo no perfil público.
- Retenção, correção e exclusão dos dados do torcedor.
- Taxonomias moderadas para música, hobbies e setores.
- Risco de perfis excessivos, inferência sensível e vieses no uso futuro.
- Passaporte do Torcedor, jogos e presença estruturada permanecem fora do modelo.
