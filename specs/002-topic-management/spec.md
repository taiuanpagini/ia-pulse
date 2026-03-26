# Feature Specification: Topic Management

**Feature Branch**: `001-trend-collection`
**Feature Directory**: `specs/002-topic-management`
**Created**: 2026-03-25
**Status**: Draft
**Input**: Gerenciamento de tópicos de monitoramento de IA (Infraestrutura, Regulamentação etc.), associação de tendências coletadas a tópicos, e listagem filtrável por tópico, fonte e período com exibição de score atual.

---

## User Scenarios & Testing

> **Regra de escrita das User Stories**: descritas em linguagem de negócio, focadas em resultado para o usuário. Sem detalhes de implementação.

---

### User Story 1 — Filtrar Tendências por Tópico, Fonte e Período (Priority: P1)

**As a** analista de pesquisa em IA  
**I want** filtrar a lista de tendências coletadas por tópico, por fonte de dados e por período de coleta  
**So that** eu possa focar nos temas relevantes para minha pesquisa atual sem precisar percorrer todo o conteúdo disponível

A plataforma agrega conteúdo de múltiplas fontes e sobre múltiplos temas. Sem filtros, o volume de itens dificulta o trabalho de análise. O analista precisa restringir a visualização ao que é relevante para ele naquele momento — por exemplo, ver apenas regulamentação da última semana, ou apenas papers de infraestrutura do arXiv.

**Why this priority**: É a funcionalidade de navegação central. Sem filtros eficientes, o valor do sistema é comprometido à medida que o volume de tendências cresce diariamente.

**Independent Test**: Pode ser testado com dados coletados de múltiplas fontes e tópicos, aplicando cada filtro individualmente e em combinação, e verificando que apenas os itens correspondentes são exibidos.

**Acceptance Scenarios**:

```gherkin
Scenario: Filtrar tendências por um tópico específico
  Given que existem tendências coletadas de múltiplos tópicos
  When o analista seleciona o tópico "Infraestrutura"
  Then apenas tendências associadas ao tópico "Infraestrutura" são exibidas
  And tendências de outros tópicos não aparecem na listagem

Scenario: Filtrar tendências por fonte de dados
  Given que existem tendências coletadas de múltiplas fontes
  When o analista seleciona a fonte "arXiv"
  Then apenas tendências originadas do arXiv são exibidas

Scenario: Filtrar tendências por período de coleta
  Given que existem tendências coletadas em datas distintas
  When o analista define um período de coleta (ex: últimos 7 dias)
  Then apenas tendências coletadas dentro desse período são exibidas

Scenario: Combinar múltiplos filtros simultaneamente
  Given que existem tendências de múltiplos tópicos, fontes e datas
  When o analista seleciona o tópico "Regulamentação" e a fonte "EUR-Lex" e o período "últimos 30 dias"
  Then apenas tendências que satisfazem todos os critérios selecionados são exibidas

Scenario: Nenhuma tendência corresponde aos filtros aplicados
  Given que filtros são aplicados
  And nenhuma tendência corresponde à combinação de filtros
  When o sistema processa a consulta
  Then a listagem exibe mensagem indicando ausência de resultados para os filtros aplicados
```

---

### User Story 2 — Visualizar Listagem com Informações Essenciais e Score (Priority: P1)

**As a** analista de pesquisa em IA  
**I want** ver na listagem o título, resumo, fonte, tópico e score atual de cada tendência  
**So that** eu possa avaliar rapidamente a relevância de cada item e priorizar quais aprofundar

A listagem é o ponto de entrada principal da plataforma. O analista precisa de informação suficiente para decidir se vale abrir o detalhe de uma tendência ou pular para a próxima. O score atual indica se a tendência já foi avaliada e qual foi o resultado, permitindo priorizar itens ainda não pontuados.

**Why this priority**: A qualidade da experiência de listagem determina a eficiência do processo de análise. Um card de tendência sem informação suficiente força o analista a abrir cada item individualmente.

**Independent Test**: Pode ser testado verificando que cada item na listagem exibe título, resumo (truncado se necessário), nome da fonte, tag do tópico e, quando disponível, o score total; itens sem score exibem indicação visual de "não avaliado".

**Acceptance Scenarios**:

```gherkin
Scenario: Listagem exibe informações essenciais de cada tendência
  Given que existem tendências coletadas na base de dados
  When o analista acessa a listagem de tendências
  Then cada item exibe título, resumo, fonte de origem e tópico associado

Scenario: Tendência com score exibe pontuação na listagem
  Given que uma tendência possui score registrado
  When essa tendência aparece na listagem
  Then o score total é exibido junto ao item
  And um indicador visual diferencia o nível do score (baixo, médio, alto, crítico)

Scenario: Tendência sem score exibe indicação de "não avaliado"
  Given que uma tendência ainda não possui score registrado
  When essa tendência aparece na listagem
  Then o item exibe indicação visual de que ainda não foi avaliado
```

---

### User Story 3 — Gerenciar Tópicos de Monitoramento (Priority: P2)

**As a** administrador do sistema  
**I want** cadastrar, visualizar e editar tópicos de monitoramento (nome, slug e descrição)  
**So that** o sistema de coleta e filtragem permaneça organizado e consistente com as áreas de interesse da empresa

Os tópicos são a estrutura de classificação central do sistema. Novos temas de interesse podem surgir (ex: "Agentes Autônomos", "IA Generativa") e tópicos existentes podem precisar de atualização de descrição. O slug garante unicidade e é usado internamente para associação com as fontes de coleta.

**Why this priority**: Depende da coleta (feature 001) mas não bloqueia a visualização. Tópicos iniciais podem ser pré-cadastrados; a gestão dinâmica é um refinamento importante mas não crítico para o MVP de análise.

**Independent Test**: Pode ser testado criando um novo tópico, verificando que aparece nos filtros da listagem, associando uma tendência a ele e confirmando que o filtro por esse tópico retorna a tendência corretamente.

**Acceptance Scenarios**:

```gherkin
Scenario: Cadastrar novo tópico
  Given que o administrador acessa a gestão de tópicos
  When preenche nome, slug e descrição e confirma o cadastro
  Then o novo tópico é registrado no sistema
  And passa a aparecer como opção nos filtros da listagem de tendências

Scenario: Cadastrar tópico com slug já existente
  Given que já existe um tópico com o slug "infraestrutura"
  When o administrador tenta cadastrar outro tópico com o mesmo slug
  Then o sistema impede o cadastro
  And exibe mensagem indicando que o slug já está em uso

Scenario: Editar descrição de tópico existente
  Given que existe um tópico cadastrado
  When o administrador edita a descrição do tópico e salva
  Then a nova descrição é registrada
  And as tendências associadas ao tópico permanecem associadas normalmente

Scenario: Visualizar lista de tópicos cadastrados
  Given que existem tópicos cadastrados no sistema
  When o administrador acessa a gestão de tópicos
  Then todos os tópicos são listados com nome, slug e descrição
```

---

### Edge Cases

- O que acontece quando o analista remove todos os filtros ativos? (deve retornar à listagem completa)
- O que acontece quando existem mais tendências do que cabem em uma página? (paginação deve ser aplicada)
- O que acontece se um tópico é renomeado? (tendências já associadas devem continuar associadas pelo slug)
- O que acontece se a listagem é acessada sem nenhuma tendência coletada ainda? (estado vazio deve ser tratado com mensagem orientadora)
- O que acontece se o analista aplica filtros que resultam em lista vazia? (mensagem de ausência de resultados, não erro)

---

## Requirements

### Functional Requirements

- **FR-001**: O sistema DEVE exibir uma listagem de tendências contendo, por item: título, resumo, fonte de origem, tópico associado e score atual (quando disponível)
- **FR-002**: O sistema DEVE indicar visualmente tendências sem score como "não avaliadas"
- **FR-003**: O sistema DEVE permitir filtrar a listagem por tópico (um ou mais)
- **FR-004**: O sistema DEVE permitir filtrar a listagem por fonte de dados
- **FR-005**: O sistema DEVE permitir filtrar a listagem por período de coleta
- **FR-006**: O sistema DEVE suportar combinação simultânea de múltiplos filtros
- **FR-007**: O sistema DEVE exibir mensagem de ausência de resultados quando nenhuma tendência corresponder aos filtros aplicados
- **FR-008**: O sistema DEVE permitir cadastrar qualquer número de tópicos com nome, slug único e descrição, sem limite fixo de categorias — novos temas de monitoramento podem ser adicionados a qualquer momento
- **FR-009**: O sistema DEVE impedir o cadastro de tópicos com slug duplicado
- **FR-010**: O sistema DEVE permitir editar a descrição de um tópico existente
- **FR-011**: O sistema DEVE listar todos os tópicos cadastrados
- **FR-012**: Os tópicos disponíveis nos filtros DEVEM refletir os tópicos cadastrados no sistema
- **FR-013**: A listagem DEVE aplicar paginação quando o número de itens exceder o limite por página

### Non-Functional Requirements

- **NFR-001 (Performance)**: A listagem com filtros aplicados DEVE retornar resultados em menos de 2 segundos
- **NFR-002 (Usabilidade)**: Os filtros ativos DEVEM ser visualmente identificáveis e individualmente removíveis
- **NFR-003 (Consistência)**: O slug de um tópico DEVE ser imutável após o cadastro para garantir consistência das associações
- **NFR-004 (Consistência visual)**: A tag de cada tópico DEVE usar a mesma cor em todas as páginas do sistema — listagem, dashboard e detalhe; a cor é atribuída ao tópico e não à página

### Key Entities

- **Topic**: representa uma área temática de monitoramento — possui nome (exibição), slug (identificador único e imutável), e descrição
- **Trend** *(referência da feature 001)*: cada tendência coletada possui `topicSlug` que a associa a um tópico; exibe score total quando disponível

---

## Architectural Considerations

### Caching

- **Needed?** NO
- **Justification**: Volume baixo de usuários internos. Listagem com filtros é suficientemente rápida com índices no banco.

### Message Queues / Async Processing

- **Needed?** NO
- **Justification**: Operações de leitura/escrita de tópicos e listagem são síncronas e de baixa complexidade.

### Event Streaming

- **Needed?** NO
- **Justification**: Sem necessidade de atualização em tempo real na listagem.

### Background Jobs / Scheduled Tasks

- **Needed?** NO
- **Justification**: Nenhuma operação agendada nesta feature.

---

## Test Scenarios

> **Test scenarios para esta feature estão documentados em [`test-scenarios.md`](./test-scenarios.md)**.
> Total de cenários: 19 | US01: 5 | US02: 4 | US03: 4 | Edge Cases: 4 | NFR: 2

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Aplicar filtro por tópico retorna apenas tendências associadas ao tópico selecionado, sem exceções
- **SC-002**: Combinação de três filtros simultâneos (tópico + fonte + período) retorna conjunto correto de tendências
- **SC-003**: Tendências com score exibem pontuação; tendências sem score exibem indicação "não avaliado" — 100% dos itens na listagem seguem esse padrão
- **SC-004**: Cadastro de tópico com slug duplicado é bloqueado com mensagem de erro
- **SC-005**: Listagem com filtros retorna resultados em menos de 2 segundos
- **SC-006**: Novo tópico cadastrado aparece imediatamente nos filtros disponíveis da listagem
