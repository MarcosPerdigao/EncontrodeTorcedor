# Modelo de perfil público

## Objetivo

A projeção pública oferece motivos para iniciar uma conversa sem descrever toda a pessoa. Ela não é um documento do Firestore, não é Account, Identity ou FanProfile e não pode ser produzida pelo cliente.

Fluxo:

Account → Identity → FanProfile + PublicProfileSettings → projeção no servidor → PublicProfileDTO

## Allowlist pública

- profileRef: referência pública opaca, sem UID codificado.
- displayName: primeiro nome ou apelido escolhido, um único termo, até 32 caracteres.
- age: inteiro calculado no servidor a partir do nascimento privado.
- city: rótulo de cidade/região ampla vindo de catálogo canônico.
- bio: texto opcional de até 160 caracteres, sem contato, handle ou link.
- photos: até seis referências públicas opacas já aprovadas, com ordem.
- verificationBadge: literal verified, presente somente quando o estado interno é verified.
- fanIdentity: nome/nome curto do clube, intensidade, nomes canônicos de ídolos e experiência ampla de estádio.
- lifestyle: música, hobbies, estilo de vida e pets, somente com opt-in.
- connectionIntents: intenções canônicas, somente com opt-in.

Conta básica não recebe rótulo negativo. Ausência de verificationBadge significa apenas que nenhum selo é exibido.

## Fontes privadas

PublicProfileSettings guarda somente escolhas editáveis de exposição: displayName, cityId, bio e os opt-ins de lifestyle/intenção. A idade vem de Identity; o selo vem do estado vigente da conta; clube, ídolos, estádio e interesses vêm de FanDomain; cidade e nomes canônicos vêm de catálogos; fotos vêm de registros internos aprovados.

O cliente não define idade, selo, trustLevel, accountStatus, eligibilityStatus, identidade editorial, owner de foto ou moderação.

## Informação proibida

Nunca projetar CPF, documento, UID, accountRef, nascimento, e-mail, telefone, IP, token, claims, papel administrativo, status interno de conta/elegibilidade/identidade, status editorial, status de moderação, storagePath, coordenadas, GPS, geohash, bairro, endereço, distância ou jogos/datas/estádios recentes.

Instagram, TikTok, Facebook e WhatsApp não têm campos. Links, e-mails, handles e padrões de telefone são recusados no texto configurável.

## Cidade e localização

A configuração salva cityId canônico; a resposta contém somente o rótulo amplo da cidade. Catálogo real e governança ainda são futuros. Nenhuma coordenada ou cálculo de distância existe.

## Fotos

PhotoReference é modelo interno preparatório:

- photoId;
- ownerAccountRef;
- status: pending, ready ou unavailable;
- ordering;
- moderationStatus: pending, approved ou rejected.

PublicPhotoDTO contém somente photoRef e order. Nenhum upload, URL, arquivo, metadata, token ou Storage público foi implementado. As Rules continuam deny-all.

## Bloqueio futuro

Antes de qualquer endpoint de terceiros, bloqueio em qualquer direção deve impedir descoberta, perfil, mídia e interação, com resposta neutra. Esta etapa não implementa consulta entre pessoas nem descoberta.

## Passaporte do Torcedor

Permanece V2. Jogos específicos, datas, ingressos, estádios recentes e histórico detalhado não entram na projeção atual.

## Riscos e itens adiados

Autorização por audiência e bloqueio, política de edição, catálogo real de cidades, moderação de texto, upload/processamento de fotos, cache/revogação de mídia, retenção, acessibilidade da apresentação e testes culturais do displayName. Descoberta, ranking, algoritmo, swipe, like, match e chat continuam fora do escopo.
