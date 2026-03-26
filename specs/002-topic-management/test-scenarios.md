# Test Scenarios: Topic Management

**Feature Branch**: `001-trend-collection`
**Feature Directory**: `specs/002-topic-management`
**Generated from**: `spec.md`
**Total scenarios**: 19 | US01: 5 | US02: 4 | US03: 4 | Edge Cases: 4 | NFR: 2

---

## User Story 1 — Filtrar Tendências por Tópico, Fonte e Período (P1)

> Source: spec.md → User Story 1

### TS-US01-001: Filtro por tópico exibe apenas tendências do tópico selecionado

- **Type**: Happy Path
- **Preconditions**: Existem tendências coletadas associadas a pelo menos dois tópicos distintos (ex: "Infraestrutura" e "Regulamentação")
- **Gherkin**:
  ```gherkin
  Scenario: Filtrar por tópico único
    Given que existem tendências dos tópicos "Infraestrutura" e "Regulamentação" na base
    When o analista seleciona o filtro de tópico "Infraestrutura"
    Then apenas tendências com tópico "Infraestrutura" são exibidas na listagem
    And tendências do tópico "Regulamentação" não aparecem
  ```
- **Expected Result**: Listagem contém exclusivamente itens do tópico selecionado
- **Acceptance Criteria**: Maps to FR-003

---

### TS-US01-002: Filtro por fonte exibe apenas tendências da fonte selecionada

- **Type**: Happy Path
- **Preconditions**: Existem tendências coletadas de pelo menos duas fontes distintas (ex: arXiv e EUR-Lex)
- **Gherkin**:
  ```gherkin
  Scenario: Filtrar por fonte de dados
    Given que existem tendências do arXiv e do EUR-Lex na base
    When o analista seleciona o filtro de fonte "arXiv"
    Then apenas tendências originadas do arXiv são exibidas
    And tendências do EUR-Lex não aparecem
  ```
- **Expected Result**: Listagem contém exclusivamente itens da fonte selecionada
- **Acceptance Criteria**: Maps to FR-004

---

### TS-US01-003: Filtro por período exibe apenas tendências coletadas no intervalo

- **Type**: Happy Path
- **Preconditions**: Existem tendências coletadas em datas distintas, incluindo dentro e fora do período de 7 dias
- **Gherkin**:
  ```gherkin
  Scenario: Filtrar por período de coleta dos últimos 7 dias
    Given que existem tendências coletadas há 3 dias e há 15 dias
    When o analista seleciona o período "últimos 7 dias"
    Then apenas a tendência coletada há 3 dias é exibida
    And a tendência coletada há 15 dias não aparece
  ```
- **Expected Result**: Apenas itens dentro do intervalo de datas selecionado são exibidos
- **Acceptance Criteria**: Maps to FR-005

---

### TS-US01-004: Combinação de múltiplos filtros retorna interseção correta

- **Type**: Alternative Path
- **Preconditions**: Existem tendências de múltiplos tópicos, fontes e períodos; apenas algumas satisfazem todos os critérios combinados
- **Gherkin**:
  ```gherkin
  Scenario: Aplicar três filtros simultaneamente
    Given que existem tendências de vários tópicos, fontes e períodos
    When o analista seleciona tópico "Regulamentação", fonte "EUR-Lex" e período "últimos 30 dias"
    Then apenas tendências que satisfazem os três critérios simultaneamente são exibidas
    And tendências que satisfazem apenas parte dos critérios não aparecem
  ```
- **Expected Result**: Listagem contém exatamente os itens que correspondem à interseção de todos os filtros ativos
- **Acceptance Criteria**: Maps to FR-006

---

### TS-US01-005: Nenhum resultado para combinação de filtros exibe mensagem orientadora

- **Type**: Negative / Error
- **Preconditions**: Nenhuma tendência satisfaz a combinação de filtros aplicada
- **Gherkin**:
  ```gherkin
  Scenario: Filtros sem resultados correspondentes
    Given que nenhuma tendência corresponde à combinação de filtros selecionada
    When o sistema processa a consulta com os filtros ativos
    Then a listagem exibe mensagem indicando ausência de resultados
    And não é exibida mensagem de erro técnico
  ```
- **Expected Result**: Mensagem de ausência de resultados exibida de forma clara; nenhum erro técnico exposto ao usuário
- **Acceptance Criteria**: Maps to FR-007

---

## User Story 2 — Visualizar Listagem com Informações Essenciais e Score (P1)

> Source: spec.md → User Story 2

### TS-US02-001: Listagem exibe campos obrigatórios de cada tendência

- **Type**: Happy Path
- **Preconditions**: Existem tendências coletadas na base de dados
- **Gherkin**:
  ```gherkin
  Scenario: Visualizar listagem com campos essenciais
    Given que existem tendências coletadas na base de dados
    When o analista acessa a listagem de tendências
    Then cada item exibe título, resumo, nome da fonte e tópico associado
  ```
- **Expected Result**: Todos os campos obrigatórios visíveis em cada card da listagem
- **Acceptance Criteria**: Maps to FR-001

---

### TS-US02-002: Tendência com score exibe pontuação e indicador de nível

- **Type**: Alternative Path
- **Preconditions**: Ao menos uma tendência possui score registrado
- **Gherkin**:
  ```gherkin
  Scenario: Tendência avaliada exibe score e nível na listagem
    Given que uma tendência possui score total registrado
    When essa tendência aparece na listagem
    Then o score total é exibido junto ao item
    And um indicador visual de nível (baixo, médio, alto ou crítico) é exibido
  ```
- **Expected Result**: Score total visível com indicador de nível correspondente
- **Acceptance Criteria**: Maps to FR-001, FR-002

---

### TS-US02-003: Tendência sem score exibe indicação "não avaliado"

- **Type**: Alternative Path
- **Preconditions**: Ao menos uma tendência não possui score registrado
- **Gherkin**:
  ```gherkin
  Scenario: Tendência sem score exibe estado "não avaliado"
    Given que uma tendência ainda não possui score registrado
    When essa tendência aparece na listagem
    Then o item exibe indicação visual de que ainda não foi avaliado
    And nenhuma pontuação numérica é exibida para esse item
  ```
- **Expected Result**: Indicação "não avaliado" visível; sem score numérico exibido
- **Acceptance Criteria**: Maps to FR-002

---

### TS-US02-004: Listagem com muitos itens aplica paginação

- **Type**: Alternative Path
- **Preconditions**: Existem mais tendências na base do que o limite por página
- **Gherkin**:
  ```gherkin
  Scenario: Listagem com volume de itens acima do limite por página
    Given que existem mais tendências do que o limite de itens por página
    When o analista acessa a listagem
    Then os itens são divididos em páginas
    And controles de navegação entre páginas são exibidos
    And a primeira página exibe o número correto de itens
  ```
- **Expected Result**: Paginação ativa; número correto de itens por página; navegação funcional
- **Acceptance Criteria**: Maps to FR-013

---

## User Story 3 — Gerenciar Tópicos de Monitoramento (P2)

> Source: spec.md → User Story 3

### TS-US03-001: Cadastrar novo tópico com dados válidos

- **Type**: Happy Path
- **Preconditions**: Slug do novo tópico não existe na base; administrador acessa gestão de tópicos
- **Gherkin**:
  ```gherkin
  Scenario: Cadastro de novo tópico com dados únicos
    Given que o administrador acessa a gestão de tópicos
    And o slug "agentes-autonomos" não existe na base de dados
    When preenche nome "Agentes Autônomos", slug "agentes-autonomos" e descrição válida e confirma
    Then o tópico é cadastrado com sucesso
    And aparece na lista de tópicos gerenciados
    And passa a estar disponível como opção nos filtros da listagem de tendências
  ```
- **Expected Result**: Tópico criado e imediatamente disponível nos filtros
- **Acceptance Criteria**: Maps to FR-008, FR-012

---

### TS-US03-002: Cadastro com slug duplicado é bloqueado

- **Type**: Negative / Error
- **Preconditions**: Já existe tópico com slug "infraestrutura" na base
- **Gherkin**:
  ```gherkin
  Scenario: Tentativa de cadastro com slug já existente
    Given que já existe um tópico com slug "infraestrutura"
    When o administrador tenta cadastrar novo tópico com o mesmo slug "infraestrutura"
    Then o sistema bloqueia o cadastro
    And exibe mensagem indicando que o slug já está em uso
    And nenhum novo tópico é criado
  ```
- **Expected Result**: Cadastro bloqueado; mensagem de erro sobre slug duplicado; base de dados não modificada
- **Acceptance Criteria**: Maps to FR-009

---

### TS-US03-003: Editar descrição de tópico existente

- **Type**: Happy Path
- **Preconditions**: Existe tópico cadastrado; administrador acessa gestão de tópicos
- **Gherkin**:
  ```gherkin
  Scenario: Editar descrição de tópico
    Given que existe um tópico com descrição "Monitoramento de hardware de IA"
    When o administrador altera a descrição para "GPUs, TPUs, edge computing e quantização de modelos" e salva
    Then a nova descrição é exibida no tópico
    And as tendências associadas ao tópico permanecem associadas normalmente
  ```
- **Expected Result**: Descrição atualizada; associações de tendências preservadas
- **Acceptance Criteria**: Maps to FR-010

---

### TS-US03-004: Listar todos os tópicos cadastrados

- **Type**: Happy Path
- **Preconditions**: Existem tópicos cadastrados no sistema
- **Gherkin**:
  ```gherkin
  Scenario: Visualizar lista completa de tópicos
    Given que existem tópicos cadastrados no sistema
    When o administrador acessa a gestão de tópicos
    Then todos os tópicos são listados
    And cada tópico exibe nome, slug e descrição
  ```
- **Expected Result**: Lista completa de tópicos com todos os campos visíveis
- **Acceptance Criteria**: Maps to FR-011

---

## Edge Cases

> Derived from spec.md → Edge Cases section

### TS-EC-001: Remover todos os filtros retorna listagem completa

- **Type**: Edge Case
- **Preconditions**: Analista aplicou filtros; listagem exibe subconjunto de tendências
- **Gherkin**:
  ```gherkin
  Scenario: Limpar todos os filtros ativos
    Given que o analista aplicou filtros de tópico e fonte
    And a listagem exibe um subconjunto filtrado de tendências
    When o analista remove todos os filtros ativos
    Then a listagem retorna a exibir todas as tendências disponíveis
    And nenhum filtro ativo é exibido
  ```
- **Expected Result**: Listagem completa restaurada; nenhum filtro residual
- **Acceptance Criteria**: Maps to FR-003, FR-004, FR-005

---

### TS-EC-002: Listagem acessada sem nenhuma tendência coletada

- **Type**: Edge Case
- **Preconditions**: Base de dados não possui tendências coletadas
- **Gherkin**:
  ```gherkin
  Scenario: Listagem vazia por ausência de dados coletados
    Given que nenhuma tendência foi coletada ainda
    When o analista acessa a listagem de tendências
    Then uma mensagem orientadora é exibida indicando que ainda não há tendências coletadas
    And nenhum erro técnico é exposto
  ```
- **Expected Result**: Estado vazio tratado com mensagem clara; sem erro
- **Acceptance Criteria**: Maps to FR-001, FR-007

---

### TS-EC-003: Tópico renomeado mantém associação com tendências existentes

- **Type**: Edge Case
- **Preconditions**: Tópico "Infraestrutura" possui tendências associadas; slug é imutável
- **Gherkin**:
  ```gherkin
  Scenario: Editar nome de tópico não rompe associações existentes
    Given que o tópico com slug "infraestrutura" possui tendências associadas
    When o administrador edita o nome do tópico para "Infraestrutura de IA"
    Then as tendências anteriormente associadas continuam associadas ao tópico
    And o filtro por tópico ainda retorna essas tendências corretamente
  ```
- **Expected Result**: Associações preservadas após mudança de nome; slug imutável garante consistência
- **Acceptance Criteria**: Maps to FR-010, NFR-003

---

### TS-EC-004: Filtros ativos são identificáveis e removíveis individualmente

- **Type**: Edge Case
- **Preconditions**: Analista aplicou dois ou mais filtros simultaneamente
- **Gherkin**:
  ```gherkin
  Scenario: Remover apenas um filtro de uma combinação ativa
    Given que o analista aplicou filtros de tópico "Regulamentação" e fonte "ANPD"
    When o analista remove apenas o filtro de fonte "ANPD"
    Then a listagem é atualizada mantendo apenas o filtro de tópico "Regulamentação"
    And o filtro de fonte "ANPD" não está mais ativo
  ```
- **Expected Result**: Filtro removido individualmente; demais filtros preservados; listagem atualizada
- **Acceptance Criteria**: Maps to FR-006, NFR-002

---

## Non-Functional Requirements

> Derived from spec.md → Non-Functional Requirements

### TS-NFR-001: Listagem com filtros retorna resultados em menos de 2 segundos

- **Type**: Performance
- **Preconditions**: Base de dados com volume representativo de tendências; filtros aplicados
- **Gherkin**:
  ```gherkin
  Scenario: Performance da listagem com filtros ativos
    Given que a base contém tendências de múltiplos tópicos e fontes
    When o analista aplica um ou mais filtros e a consulta é executada
    Then os resultados são exibidos em menos de 2 segundos
  ```
- **Expected Result**: Tempo de resposta < 2 segundos para qualquer combinação de filtros
- **Acceptance Criteria**: Maps to NFR-001

---

### TS-NFR-002: Slug de tópico não pode ser alterado após cadastro

- **Type**: Constraint Validation
- **Preconditions**: Tópico já cadastrado com slug definido
- **Gherkin**:
  ```gherkin
  Scenario: Tentativa de alterar slug de tópico existente
    Given que existe um tópico com slug "regulamentacao"
    When o administrador tenta modificar o slug do tópico
    Then o sistema não permite a alteração do slug
    And o slug permanece "regulamentacao"
  ```
- **Expected Result**: Campo slug não editável após cadastro; consistência das associações preservada
- **Acceptance Criteria**: Maps to NFR-003
