# Revisão da Etapa 1.5

Data: 17/09/2026. Branch: `codex/auth-identity-foundation`. Base: `536fedd`.

## Resultado e limite

Sincronização documental concluída, sem alteração de código funcional, dependências, contratos executáveis, Rules ou CI. Etapa 2 não iniciada. A instrução de 17/09 prevalece: aguardar revisão intermediária e nova instrução antes de implementar autenticação, identidade ou conta.

## Decisões incorporadas

- Plataforma nacional multiclube; Atlético Mineiro apenas piloto. Clubes, ídolos e cultura configuráveis. Não é feed, rede de seguidores, influência, clone de Tinder ou somente namoro.
- Cartilha superior: afinidade, identidade sem exposição, segurança antes de engajamento, respeito e experiências culturais por torcida.
- Denúncias recebidas, revisadas, procedentes e incidentes são conceitos distintos. Marcos propostos 1–2/3/5 dependem de procedência, integridade, deduplicação e revisão; incidentes graves independem de contagem. Sem automação disciplinar nesta entrega.
- Segurança considerando riscos para mulheres, ferramentas universais, educação contextual e Encontro Seguro somente futuro.
- Catálogos canônicos de clubes/ídolos/aliases, sugestões moderadas e política editorial auditável/revisável; sem julgamento automático por IA ou notícias.
- Perfil futuro mínimo e opcional, cinco intenções, simpatias autodeclaradas e abertura bilateral entre torcidas.
- Hard filters antes de ordenação; pesos 40/25/20/15 são hipóteses configuráveis. Explicações sem percentual de compatibilidade e sem revelar preferências privadas.
- Auditoria operacional separada de analytics minimizados; versão e razões do algoritmo futuras. Proibidos dados privados nos analytics.
- V1 conexões e segurança; V2 Passaporte; V3 Dia de Jogo; V4 melhorias do motor; V5 gamificação saudável.
- Preservadas: Rules deny-all, backend mediador, referências opacas, DTOs por allowlist, ausência de localização precisa, dados sintéticos, CPF bruto/hash simples proibidos e retenção pendente.

## Arquivos criados

- docs/PROJECT_STATE.md
- docs/SAFETY_CHARTER.md
- docs/PROFILE_MODEL.md
- docs/MATCH_ENGINE.md
- docs/ROADMAP.md
- docs/stage-1.5-review.md

## Arquivos existentes alterados

- README.md
- docs/product.md
- docs/architecture.md
- docs/data-model.md
- docs/authorization.md
- docs/threat-model.md
- docs/security-principles.md
- docs/retention.md
- docs/development.md

## Divergências e resolução

1. Produto anterior limitado ao Atlético Mineiro: substituído por plataforma nacional com piloto. O nome provisório legado na configuração do app não foi alterado, pois esta entrega é somente documental; não existe modelo funcional acoplado ao clube.
2. Presença em partidas aparecia em V2: agora Passaporte em V2 e Dia de Jogo em V3.
3. Autorização anterior permitiria iniciar etapa 2 após testes: nova ordem exige revisão intermediária e instrução expressa. Documentos atuais alinhados; relatório 0/1 preservado como registro histórico.
4. Intenção “companhia para jogos” não autoriza catálogo/presença em partidas no MVP.
5. Local informado para Encontro Seguro pode ser localização precisa: permanece fora do escopo e depende de revisão específica da proibição vigente.
6. Perfil futuro menciona verificação, mas detalhes/provas são privados. O contrato executável atual não foi ampliado; indicador público futuro exige nova allowlist e testes.
7. Repositório criado originalmente como privado foi observado como PUBLIC pela API em 16/09. Recomendada avaliação de privacidade, sem alteração automática de visibilidade ou rulesets.
8. Os limiares disciplinares são política proposta com procedimento pendente, não banimento por contagem bruta nem implementação autorizada.
9. Proteção de enumeração não deve ser prometida apenas por mensagens genéricas: a [documentação do provedor](https://docs.cloud.google.com/identity-platform/docs/admin/email-enumeration-protection) informa que cadastro ainda pode retornar EMAIL_EXISTS. Verificação de comportamento e controles de lançamento pertencem à etapa futura.

## Decisões pendentes

Nova instrução para implementar etapa 2; provedor de identidade/aferição de idade; procedimentos de moderação/contestação e política editorial; retenção por finalidade; semântica transparente de rivais; privacidade dos opcionais de perfil; pesos/equidade de ranking; Google e avaliação de Apple no iOS; App Check e configuração Firebase development real; proteção de main e visibilidade do repositório. Nenhuma dessas configurações foi aplicada.

## Verificações executadas

Checkpoint local em 16/09/2026, antes de qualquer código da etapa 2:

| Comando/controle      | Resultado                                         |
| --------------------- | ------------------------------------------------- |
| npm run format        | Aprovado                                          |
| npm run check         | Código de saída 0                                 |
| format:check          | Aprovado                                          |
| lint                  | Aprovado, sem avisos                              |
| typecheck             | Aprovado em testes, mobile, functions e contracts |
| test:unit             | 65/65, cinco arquivos                             |
| test:rules            | 191/191, nenhum ignorado                          |
| build                 | Contracts e Functions compilados                  |
| security:secrets      | 69 arquivos naquele checkpoint, 0 ocorrências     |
| security:dependencies | 0 vulnerabilidades conhecidas                     |

Total: 256 testes aprovados. Após esta revisão documental, formato e diff passaram novamente; scanner final: 70 arquivos, 0 ocorrências. Não há alteração funcional que exija testes novos. O workflow remoto da branch será iniciado pelo push; não confundir seu estado com a execução local.

O runtime Storage emitiu o aviso de encerramento já documentado na fundação, depois do sucesso dos testes e com retorno 0. Nenhum teste foi flexibilizado ou ignorado.

## Revisão cruzada

Produto, cartilha, perfil, compatibilidade, roadmap, arquitetura, dados, autorização, ameaças, retenção, princípios e desenvolvimento foram comparados. Controles futuros continuam identificados como planejamento, não entregues. Sem coleta nova, implementação de ranking, catálogo real, abertura de Rules ou prazo aprovado de mensagens. Registros históricos da fundação permanecem históricos; PROJECT_STATE é o resumo vigente.

## Commits

- `8867724` — docs: synchronize national fan connection product
- `6e7d991` — docs: add safety charter and product state
- `5ae6bf8` — docs: define profile compatibility and roadmap

Os commits finais de revisão/formatação e pausa constam no histórico da branch e na entrega. Nenhum merge em main ou alteração administrativa faz parte desta etapa.

## Próximo passo

Revisão intermediária pelo responsável. PARAR: não implementar etapa 2 até nova instrução.
