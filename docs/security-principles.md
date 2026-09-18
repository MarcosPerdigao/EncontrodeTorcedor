# Princípios de segurança

Estes invariantes se aplicam à fundação e às etapas posteriores. Exceções requerem nova decisão explícita, análise de risco e testes; conveniência de desenvolvimento não é justificativa.

1. Privacy by design/default; se não necessário, não coletar.
2. Jogos fora do MVP. GPS, coordenadas, geohash, bairro, endereço e localização precisa completamente fora do MVP.
3. Cliente não confiável. Nenhum acesso direto Firestore/Storage a dados de negócio.
4. Firestore e Storage deny-by-default, inclusive usuário autenticado e claims administrativas. Agora tudo fechado, inclusive signals.
5. Nenhuma exceção temporária de segurança, em qualquer ambiente.
6. Apenas dados sintéticos em desenvolvimento/testes. Fixtures artificiais não são pessoas reais.
7. Prazo de mensagens pendente: 180 dias é hipótese não aprovada e não entra em configuração.
8. DTOs por allowlist explícita e validação de runtime. Nunca devolver documento/snapshot Firestore ou spread de entidade.
9. Testes independentes de schema falham ao adicionar campos ao contrato público sem revisão.
10. UID interno de terceiros nunca aparece em contrato público. Usar referência opaca que não codifique UID; autorização sempre revalidada.
11. Não armazenar senhas. Nenhuma credencial, secret, service account ou chave privada no app/repositório.
12. EXPO_PUBLIC é público. Configuração empacotada não é secret. Não colocar tokens em URL, logs ou erros.
13. Dados privados separados do perfil exibível; preferências e verificação não são campos públicos.
14. Bloqueios prevalecem sobre descoberta, perfis, mídia e interações futuras.
15. Admin SDK contorna Rules; autorização de API e IAM são controles independentes.
16. Desenvolvimento, staging e produção separados. Fundação usa somente demo local; não criar produção real agora.
17. Dependências mínimas, lockfile, TypeScript strict, lint e testes obrigatórios de autorização.
18. Emuladores só em loopback; bypass para fixtures não existe em código de produção.

## Revisão de consistência da etapa 0

Arquivos product, architecture, data-model, authorization, threat-model, retention e ADRs revisados em conjunto:

- Perfis “exibíveis” continuam privados no banco e mediados pela API.
- signals é previsão futura e não permissão vigente.
- Não existe prazo aprovado de mensagens nem TTL de negócio.
- Tipos privados são internos; lista de campos proibidos não autoriza coleta.
- Coordenadas não constam do modelo MVP, mesmo privado.
- Controles futuros não são descritos como implementados.
- Na revisão histórica 0/1, produção real e etapa 2 estavam fora da autorização; etapa 2 foi posteriormente autorizada, produção continua excluída.

## Invariantes adicionais 1.5

SAFETY_CHARTER.md é regra superior de produto. Plataforma nacional, filtros bilaterais e catálogos configuráveis. Sem banimento por denúncias brutas, score de beleza, percentual público de compatibilidade ou analytics de dados privados. CPF bruto e hash simples proibidos; provedor futuro entrega prova mínima. Etapa 1.5 concluída; etapa 2 expressamente autorizada após revisão intermediária e CI aprovado, exclusivamente no escopo de autenticação/conta. Etapa 3 depende de nova autorização. A revisão acima é registro histórico da base 0/1.

## Confiança progressiva — Etapa 3

Identidade not_started permite somente capacidades básicas explicitamente autorizadas. Não verificado não significa suspeito e verificado não significa pessoa segura. Nível de confiança é derivado no servidor e nunca aceito do cliente. Suspensão, banimento, inelegibilidade, bloqueios e demais controles prevalecem.

CPF permanece fora do cadastro, mobile, logs, analytics, modelos comuns, fixtures e identificadores. Integração futura usa provedor especializado e prova mínima. Nenhuma coleta de documento ou provedor real é implementado nesta etapa.
