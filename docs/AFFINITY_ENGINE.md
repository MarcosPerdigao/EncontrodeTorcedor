# Motor de Afinidade e Compatibilidade

Status: primeira versão local da Etapa 5. Regras explícitas, sem endpoint e sem seleção ou ordenação de pessoas.

## Filosofia

O motor responde somente: “quais elementos públicos e autorizados essas duas pessoas têm em comum que podem facilitar uma conversa?”. Ele aproxima por contexto; não decide relacionamento, elegibilidade, qualidade da pessoa ou probabilidade de sucesso.

Não existe Match Score. Não existe percentual de compatibilidade, nota pessoal, popularidade, ranking, recomendação ou conjunto de “melhores perfis”. O resultado é uma lista de AffinitySignal com motivo legível.

## Separação obrigatória

DiscoveryEligibility responde se o perfil pode aparecer. Ela é calculada antes e fora do motor, considerando bloqueio, suspensão, restrições e audiência. AffinityEngine aceita somente uma decisão `eligible` já produzida pelo servidor. Qualquer outra decisão falha genericamente sem gerar sinal.

O fluxo conceitual é:

```text
DiscoveryEligibility
        ↓
PublicProfileDTO autorizado / DiscoveryCard
        ↓
AffinityContext
        ↓
AffinityEngine
        ↓
AffinityExplanation
```

O card é a apresentação reduzida. O contexto é derivado do PublicProfileDTO autorizado para preservar os campos públicos necessários; o motor não lê Account, Identity, FanProfile persistido ou documentos Firestore.

## Entradas

AffinityContext contém somente:

- clube público canônico;
- ídolos públicos canônicos;
- intensidade da torcida;
- interesse amplo em estádio, representado somente pela presença da experiência pública;
- hobbies públicos;
- preferências musicais públicas;
- estilo de vida e pets públicos opcionais;
- intenções de conexão públicas.

Não entram nome, idade, cidade, fotos ou bio porque não são necessários para as regras V1. Também não entram CPF, UID, accountRef, nascimento, contato, localização, renda, identidade civil, atributos sensíveis, mensagens, comportamento privado, denúncias ou estados administrativos.

## Regras V1

As regras formam uma taxonomia pública e fixa:

1. mesmo clube canônico;
2. mesmo ídolo canônico;
3. mesma intensidade de torcida;
4. ambos demonstram interesse amplo em estádio;
5. hobby público compartilhado;
6. preferência musical pública compartilhada;
7. mesmo estilo de vida público;
8. mesma relação pública com pets;
9. intenção de conexão compartilhada.

Cada ocorrência gera um sinal com `kind`, `sharedValue` e `explanation`. A ordem acima é apenas estabilidade de apresentação e teste, sem peso, relevância relativa ou classificação de pessoas.

Textos livres já públicos são comparados após NFKC, trim e lowercase para evitar diferenças apenas de caixa ou representação Unicode. A explicação preserva um valor público original. Clube e ídolo continuam vindo dos nomes canônicos projetados.

## Resultado

AffinityExplanation possui:

- `hasAffinity: true` e pelo menos um sinal explicado; ou
- `hasAffinity: false` e lista vazia.

Não possui score, percent, rank, weight, probability, confidence ou posição. Toda afinidade positiva tem ao menos um motivo; não há resultado “a IA decidiu”.

Exemplo conceitual:

```text
Vocês têm em comum:
✓ Torcem para Clube Horizonte
✓ Gostam do ídolo Alex da Serra
✓ Compartilham o hobby Atividade fictícia
✓ Gostam de Ritmo sintético
```

## Pesos futuros

A V1 não implementa pesos. Se uma fase futura autorizar pesos internos, eles deverão ser configuráveis, versionados, documentados, auditáveis e separados da explicação pública. Não poderão virar nota pessoal, percentual público ou justificativa opaca.

Categorias conceituais futuras: ClubAffinity, IdolAffinity, InterestAffinity, LifestyleAffinity e IntentAffinity. Elas permanecem documentação, sem valores ou cálculo nesta etapa.

## Limitações

- igualdade textual simples não compreende sinônimos ou contexto cultural;
- campos ausentes não geram inferência;
- ausência de sinal não significa incompatibilidade;
- muitos sinais não significam pessoa melhor nem relação provável;
- o motor não mede diversidade, segurança, intenção real ou consentimento;
- o motor não aprende com comportamento;
- o motor não cria nem ordena candidatos;
- catálogo e textos reais exigirão governança e moderação futuras.

## Evolução possível

V1 usa regras explícitas. V2 poderá avaliar comportamento agregado somente após autorização e revisão de privacidade. V3 poderá estudar modelos estatísticos. V4 poderá estudar machine learning. Essas possibilidades não estão autorizadas e nunca poderão remover explicabilidade, segurança, controle humano e possibilidade de auditoria.

## Decisões proibidas

O motor nunca usa aparência, fotos como pontuação, renda, gênero, religião, política, saúde, orientação sexual, localização precisa, mensagens privadas, denúncias como atração, popularidade ou valor social. Também não implementa swipe, like, match, chat ou recomendação automática.
