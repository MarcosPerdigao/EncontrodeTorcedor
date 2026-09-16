# ADR 0006 — Separar identidade privada e perfil exibível

Status: aceito. Contexto: misturar entidade persistida e resposta da API permite vazamento por adição de campos.

Decisão: identidade, preferências, verificação e administração ficam separadas da projeção exibível. PublicProfileDTO nasce de schema fechado com allowlist e testes independentes. PrivateUserData tem módulo interno e não é reexportado no entrypoint público. Não usar Omit/blacklist ou serialização direta de documento.

Consequências: mais projeções explícitas, menos risco de vazamento acidental. Idade futura será calculada no servidor; nascimento não sai. Campos textuais podem conter informação identificadora voluntária: schema não substitui moderação. Lista de campos proibidos não autoriza sua coleta. Retenção de mensagens permanece pendente.
