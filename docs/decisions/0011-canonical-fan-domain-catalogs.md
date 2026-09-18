# ADR 0011 — Catálogos canônicos e agregado do torcedor

Status: aceito para a Etapa 2.5 em 18/09/2026.

## Contexto

Texto livre para clubes e ídolos fragmenta vínculos, inviabiliza moderação e distorce analytics. Misturar conta, identidade civil e preferências futebolísticas aumenta impacto de acesso indevido. A plataforma precisa funcionar para qualquer clube desde o início.

## Decisão

Usar Club e Idol como entidades canônicas com IDs opacos e status editoriais. Aliases servem apenas para resolução e precisam ser não ambíguos. Referências do perfil são validadas contra um catálogo ativo fornecido pelo servidor.

Manter FanProfile, ConnectionPreference e LifestyleProfile separados de Account, Identity e da futura projeção pública. Rivalidade é preferência declarada, nunca classificação oficial. Fixtures versionadas são fictícias e não representam catálogo de produção.

## Alternativas rejeitadas

- Texto livre como chave: cria duplicatas e impede decisões editoriais consistentes.
- Tipos específicos por clube: acoplam o produto ao piloto.
- Copiar dados civis para o perfil: amplia exposição sem necessidade.
- Persistir um catálogo real agora: exige governança, fonte e licenciamento ainda não aprovados.
- Implementar score junto ao domínio: confunde disponibilidade de atributos com autorização de uso.

## Consequências e riscos

Mudanças de catálogo exigirão versionamento, auditoria e migração de referências. Status under_review, ineligible e retired ficam indisponíveis para nova seleção, preservando a entidade conceitualmente. A arquitetura suporta analytics futuro por IDs canônicos, mas nenhum evento ou agregado é criado nesta etapa.
