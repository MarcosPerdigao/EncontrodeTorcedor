# Produto — Projeto Match Alvinegro

Status: arquitetura aprovada como base; implementação autorizada somente para as etapas 0 (documentação) e 1 (fundação). A etapa 2 exige nova autorização. O nome é provisório, independente dos nomes técnicos dos pacotes.

## Objetivo e público

Conectar torcedores do Atlético Mineiro com 18 anos ou mais para relacionamento, amizade e companhia. A afinidade com a torcida é o ponto de partida; intenções explícitas e controle de exposição são parte da proposta de valor. Marca própria, sem escudo, mascote, fotografias ou marcas oficiais sem autorização.

## Escopo de produto planejado

| MVP futuro | Versão 2 | Avaliação futura |
| --- | --- | --- |
| Cadastro, recuperação, elegibilidade 18+, perfil, fotos e preferências | Jogos cadastrados pela administração | Integrações esportivas externas |
| Descoberta por cidade declarada e intenção, like, passar e match | “Vou ao jogo”, com audiência e duração explícitas | Proximidade, somente após nova avaliação de risco |
| Chat de texto, bloquear, desfazer match e denunciar | Setor opcional e modo Dia de Jogo | Grupos, eventos, multimídia e monetização |
| Pausar descoberta, exportar dados, excluir conta e moderação | Melhorias de recomendação | Verificação adicional de identidade |

Jogos estão fora do MVP. GPS, coordenadas, geohash, bairro, endereço e localização precisa estão completamente fora do MVP: não coletar, armazenar, processar, registrar ou retornar. Cidade será selecionada de catálogo, sem alegação de verificação; regiões pouco povoadas podem exigir exibição mais ampla.

Não haverá publicidade comportamental, importação de contatos, presença online, último acesso ou confirmação de leitura no MVP. Redes sociais não aparecem no perfil por padrão. Conteúdo de conversas não é insumo para analytics.

## Experiência planejada

Dois contextos de descoberta: relacionamentos; companhia e amizade. A pessoa escolhe onde navegar; reciprocidade deve ocorrer no mesmo contexto. Participar de ambos não transforma intenção de amizade em interesse romântico.

Fluxo: abertura → cadastro/login → elegibilidade e verificação de contato → escolhas de privacidade → perfil → preferências → prévia e ativação explícita → descoberta → match → conversa.

Navegação: Descobrir, Conexões e Perfil. Jogos só será adicionado na versão 2. Perfil incompleto, inelegível, suspenso ou pendente de aprovação não aparece na descoberta.

Requisitos: botões como alternativa aos gestos, acessibilidade, estado vazio honesto, intenção visível, denúncia/bloqueio acessíveis e notificações genéricas. Avisar sobre informações identificadoras em texto livre; não prometer anonimato de imagens ou conteúdo voluntariamente publicado.

## Limites desta entrega

Somente documentação, workspace, aplicativo vazio para validar a ferramenta, base sem endpoints de Cloud Functions, contratos estruturais, regras fechadas, testes, emuladores e CI. Não implementar autenticação, onboarding, perfil, descoberta, interações, chat, administração ou jogos.

## Condições para operação futura

- Aferição de idade proporcional e validada juridicamente; data declarada e checkbox não comprovam idade.
- Moderação, suporte, resposta a incidentes e tratamento de direitos do titular operacionais.
- Retenção de mensagens decidida por produto e jurídico: **180 dias é hipótese não aprovada**, não configuração.
- Métricas minimizadas: ativação, reciprocidade, conversas iniciadas e resposta a denúncias. Nenhuma meta justifica exposição adicional.

Ver [arquitetura](architecture.md), [retenção](retention.md) e [princípios](security-principles.md).
