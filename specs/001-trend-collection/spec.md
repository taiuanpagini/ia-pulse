# Feature Specification: Trend Collection

**Feature Branch**: `001-trend-collection`
**Created**: 2026-03-25
**Status**: Draft
**Input**: Coleta diária de tendências em IA a partir de múltiplas fontes públicas gratuitas (APIs REST e feeds RSS), com deduplicação por URL, associação a tópicos, isolamento de falhas por fonte e job agendado diário.

---

## User Scenarios & Testing

> **Regra de escrita das User Stories**: descritas em linguagem de negócio, focadas em resultado para o usuário e valor para a operação. Sem detalhes de implementação.
>
> **Regra de aceitação (Gherkin)**: cenários seguem formato Gherkin com comportamentos observáveis.

---

### User Story 1 — Coleta Automática Diária de Tendências (Priority: P1)

**As a** analista de pesquisa em IA  
**I want** que o sistema colete automaticamente artigos, papers e notícias de IA a partir de diversas fontes a cada dia  
**So that** eu tenha sempre conteúdo atualizado disponível para avaliação sem precisar buscar manualmente

O sistema deve reunir diariamente conteúdo relevante de fontes especializadas em infraestrutura de IA (hardware, modelos, benchmarks), regulamentação (legislação brasileira e europeia, frameworks de conformidade) e notícias gerais do mercado. A coleta deve ocorrer de forma programada, sem intervenção humana, e o resultado deve estar disponível para consulta na plataforma ao início do expediente.

**Why this priority**: É a funcionalidade central do produto. Sem coleta automática, todo o valor do sistema depende de esforço manual contínuo, tornando o monitoramento inviável.

**Independent Test**: Pode ser testado acionando manualmente o job de coleta e verificando que novos itens aparecem na base de dados com título, resumo, URL, fonte e tópico preenchidos.

**Acceptance Scenarios**:

```gherkin
Scenario: Coleta bem-sucedida de múltiplas fontes
  Given que o job de coleta é acionado no horário programado
  When o sistema processa todas as fontes configuradas
  Then novos itens de tendência são registrados na base de dados
  And cada item contém título, resumo, URL de origem, nome da fonte e tópico associado
  And a data de coleta é registrada em cada item

Scenario: Coleta acionada manualmente por operador autorizado
  Given que um operador aciona o endpoint de coleta com credencial válida
  When o sistema processa todas as fontes configuradas
  Then novos itens são registrados normalmente
  And o sistema retorna confirmação com o número de itens coletados por fonte

Scenario: Tentativa de acionar coleta sem credencial
  Given que uma requisição chega ao endpoint de coleta sem credencial válida
  When o sistema avalia a requisição
  Then o acesso é negado
  And nenhuma coleta é executada
```

---

### User Story 2 — Isolamento de Falhas por Fonte (Priority: P1)

**As a** analista de pesquisa em IA  
**I want** que uma falha em uma fonte de dados não interrompa a coleta das demais  
**So that** eu não perca conteúdo de fontes funcionando por causa de uma indisponibilidade pontual

Fontes externas podem ficar indisponíveis temporariamente ou retornar erros inesperados. O sistema deve tratar cada fonte de forma independente, registrar o problema e continuar coletando das demais. Ao final da execução, deve ser possível identificar quais fontes falharam e por quê.

**Why this priority**: Garante a resiliência do sistema. Sem isolamento, uma única fonte instável tornaria a coleta diária não confiável, comprometendo o propósito da ferramenta.

**Independent Test**: Pode ser testado configurando temporariamente uma fonte com URL inválida e verificando que as demais fontes coletam normalmente e que o erro da fonte inválida é registrado.

**Acceptance Scenarios**:

```gherkin
Scenario: Uma fonte retorna erro durante a coleta
  Given que o job de coleta é acionado
  And uma das fontes configuradas está indisponível
  When o sistema processa as fontes
  Then a coleta das demais fontes é concluída normalmente
  And o erro da fonte indisponível é registrado com identificação da fonte e descrição do erro
  And o resultado final indica quais fontes tiveram sucesso e quais falharam

Scenario: Todas as fontes funcionam normalmente
  Given que o job de coleta é acionado
  And todas as fontes estão disponíveis
  When o sistema processa todas as fontes
  Then itens de todas as fontes são coletados e registrados
  And nenhum erro é reportado
```

---

### User Story 3 — Deduplicação de Conteúdo (Priority: P2)

**As a** analista de pesquisa em IA  
**I want** que conteúdos já coletados anteriormente não sejam registrados novamente  
**So that** eu não precise lidar com duplicatas ao avaliar tendências

O mesmo artigo ou notícia pode aparecer em múltiplas execuções da coleta (ex: um paper que permanece no top de resultados por dias). O sistema deve identificar automaticamente conteúdo já existente pela sua URL única e ignorá-lo, sem gerar erro.

**Why this priority**: Sem deduplicação, a base de dados cresce com duplicatas, degradando a qualidade da experiência de análise e gerando trabalho desnecessário de avaliação.

**Independent Test**: Pode ser testado executando a coleta duas vezes seguidas e verificando que o número de itens na base não dobra — itens da segunda execução com URL já existente são descartados silenciosamente.

**Acceptance Scenarios**:

```gherkin
Scenario: Item já existente é coletado novamente
  Given que um item com determinada URL já existe na base de dados
  When o sistema coleta um novo item com a mesma URL
  Then o item duplicado não é inserido novamente
  And o item existente não é modificado
  And a contagem de novos itens da execução não inclui o duplicado

Scenario: Item com URL nova é coletado
  Given que nenhum item com determinada URL existe na base de dados
  When o sistema coleta um item com essa URL
  Then o item é inserido normalmente na base de dados
```

---

### User Story 4 — Verificação de Saúde do Sistema (Priority: P3)

**As a** operador do sistema  
**I want** verificar se o sistema está operacional e conectado à base de dados  
**So that** eu possa diagnosticar rapidamente problemas de infraestrutura antes que afetem a coleta

Um endpoint de saúde permite monitoramento externo e diagnóstico rápido. Deve indicar se a conectividade com a base de dados está ativa, sendo útil para alertas automáticos e troubleshooting.

**Why this priority**: Suporte operacional. Não afeta a funcionalidade principal mas é essencial para manutenção confiável do sistema em produção.

**Independent Test**: Pode ser testado acessando `GET /api/health` e verificando resposta com status do sistema e da conectividade com a base de dados.

**Acceptance Scenarios**:

```gherkin
Scenario: Sistema operacional com base de dados acessível
  Given que o sistema está em execução
  And a base de dados está acessível
  When uma requisição é feita ao endpoint de saúde
  Then a resposta indica que o sistema está operacional
  And a resposta confirma que a base de dados está conectada

Scenario: Base de dados inacessível
  Given que o sistema está em execução
  And a base de dados está inacessível
  When uma requisição é feita ao endpoint de saúde
  Then a resposta indica que há problema de conectividade com a base de dados
  And o status HTTP da resposta reflete a falha
```

---

### Edge Cases

- O que acontece quando uma fonte retorna uma lista vazia de resultados? (não deve ser tratado como erro)
- O que acontece quando uma fonte retorna dados com campos obrigatórios ausentes (título ou URL)? (item deve ser descartado e logado)
- O que acontece se o job é acionado enquanto uma execução anterior ainda está em andamento?
- O que acontece se a base de dados fica indisponível durante a persistência dos itens coletados?
- O que acontece se uma fonte aplica rate limiting e rejeita a requisição?
- O que acontece se o conteúdo RSS de uma fonte não segue o formato padrão esperado?

---

## Requirements

### Functional Requirements

- **FR-001**: O sistema DEVE coletar artigos e papers do arXiv nas categorias cs.LG e cs.AR
- **FR-002**: O sistema DEVE coletar discussões e links do HackerNews
- **FR-003**: O sistema DEVE coletar posts populares do Reddit (r/MachineLearning e r/artificial)
- **FR-004**: O sistema DEVE coletar papers do Semantic Scholar
- **FR-005**: O sistema DEVE coletar papers e benchmarks do Papers With Code
- **FR-006**: O sistema DEVE coletar conteúdo dos seguintes feeds RSS — Infraestrutura: NVIDIA Developer Blog, Hugging Face Blog, Google AI Blog; Regulamentação: EUR-Lex (AI Act), ANPD, NIST AI RMF, Future of Life Institute, AI Now Institute, Stanford HAI; Geral: The Batch, Import AI, VentureBeat AI, MIT Technology Review AI
- **FR-007**: Cada item coletado DEVE ser associado a um tópico (Infraestrutura, Regulamentação ou Geral)
- **FR-008**: O sistema DEVE descartar itens cuja URL já existe na base de dados (deduplicação)
- **FR-009**: A coleta DEVE ser executada automaticamente uma vez por dia às 07:00 UTC
- **FR-010**: O endpoint de coleta DEVE rejeitar requisições sem credencial válida
- **FR-011**: A falha na coleta de uma fonte DEVE ser isolada e não interromper a coleta das demais
- **FR-012**: O resultado de cada execução DEVE registrar, por fonte: status (sucesso/falha), quantidade de itens novos coletados e, em caso de falha, descrição do erro
- **FR-013**: O sistema DEVE expor `GET /api/health` que verifica e reporta a conectividade com a base de dados

### Non-Functional Requirements

- **NFR-001 (Confiabilidade)**: O ciclo completo de coleta DEVE ser concluído em no máximo 10 minutos
- **NFR-002 (Resiliência)**: Ao menos 80% das fontes configuradas DEVEM ter sucesso por execução em condições normais
- **NFR-003 (Segurança)**: O endpoint de coleta DEVE retornar HTTP 401 para requisições sem credencial válida
- **NFR-004 (Observabilidade)**: Cada execução de coleta DEVE produzir log estruturado com resultado por fonte (fonte, status, itens coletados, erro se aplicável)
- **NFR-005 (Disponibilidade)**: O endpoint `/api/health` DEVE responder em menos de 2 segundos

### Key Entities

- **Trend**: representa um item de conteúdo coletado — possui identificador único, título, resumo, URL de origem, nome da fonte, tópico associado e data de coleta
- **Topic**: categoriza as tendências — possui nome, slug único e descrição; exemplos: Infraestrutura, Regulamentação, Geral
- **CollectionRun** *(implícito nos logs)*: representa uma execução do job de coleta — registra timestamp, fontes tentadas, fontes com sucesso, total de itens novos coletados e erros por fonte

---

## Architectural Considerations

### Caching

- **Needed?** NO
- **Justification**: Coleta é write-heavy, executada 1x/dia. Sem leituras repetidas de alta frequência nesta feature.

### Message Queues / Async Processing

- **Needed?** NO
- **Justification**: Volume de itens por execução é baixo (estimado < 500 itens/dia total). Processamento síncrono sequencial por fonte é suficiente.

### Event Streaming

- **Needed?** NO
- **Justification**: Dados são batch diários, sem consumidores em tempo real.

### Background Jobs / Scheduled Tasks

- **Needed?** YES — Vercel Cron Jobs (decisão já registrada em `architectural-decisions.md`)
- **Use cases**: Execução automática diária da coleta às 07:00 UTC
- **Schedule**: `0 7 * * *`

---

## Test Scenarios

> **Test scenarios para esta feature estão documentados em [`test-scenarios.md`](./test-scenarios.md)**.
> Total de cenários: 18 | US01: 4 | US02: 3 | US03: 3 | US04: 3 | Edge Cases: 4 | NFR: 1

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Após uma execução de coleta bem-sucedida, itens de ao menos 10 fontes distintas estão registrados na base de dados
- **SC-002**: Uma URL coletada em duas execuções consecutivas aparece apenas uma vez na base de dados
- **SC-003**: Com uma fonte configurada com URL inválida, as demais fontes coletam normalmente e o erro é registrado por fonte
- **SC-004**: O endpoint de coleta retorna HTTP 401 para 100% das requisições sem credencial válida
- **SC-005**: `GET /api/health` responde em menos de 2 segundos com status da conectividade com a base de dados
- **SC-006**: O ciclo completo de coleta com todas as fontes conclui em menos de 10 minutos
