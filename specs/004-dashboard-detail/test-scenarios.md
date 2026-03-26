# Test Scenarios: Dashboard & Trend Detail

**Feature Branch**: `001-trend-collection`
**Feature Directory**: `specs/004-dashboard-detail`
**Generated from**: `spec.md`
**Total scenarios**: 21 | US01: 3 | US02: 3 | US03: 3 | US04: 3 | US05: 3 | Edge Cases: 4 | NFR: 2

---

## User Story 1 — Visualizar Ranking de Tendências Avaliadas (P1)

> Source: spec.md → User Story 1

### TS-US01-001: Ranking exibe tendências avaliadas na ordem correta

- **Type**: Happy Path
- **Preconditions**: Existem ao menos 3 tendências avaliadas com scores distintos (ex: 4,80, 3,20, 2,10)
- **Gherkin**:
  ```gherkin
  Scenario: Dashboard ordena tendências avaliadas por score decrescente
    Given que existem tendências avaliadas com scores 4,80, 3,20 e 2,10
    When o analista acessa o dashboard
    Then as tendências aparecem nessa ordem: score 4,80 primeiro, 3,20 segundo, 2,10 terceiro
    And cada card exibe título, tag de tópico colorida, fonte, data de coleta e score total
  ```
- **Expected Result**: Ranking na ordem correta; todos os campos obrigatórios visíveis nos cards
- **Acceptance Criteria**: Maps to FR-001, FR-002

---

### TS-US01-002: Badge de nível corresponde à faixa correta do score

- **Type**: Alternative Path
- **Preconditions**: Existem tendências com scores em todas as quatro faixas
- **Gherkin**:
  ```gherkin
  Scenario: Badges de nível refletem as faixas de score corretamente
    Given que existem tendências com scores 1,80 (Baixo), 3,00 (Médio), 4,20 (Alto) e 4,75 (Crítico)
    When essas tendências aparecem no dashboard
    Then a tendência com score 1,80 exibe badge "Baixo"
    And a tendência com score 3,00 exibe badge "Médio"
    And a tendência com score 4,20 exibe badge "Alto"
    And a tendência com score 4,75 exibe badge "Crítico"
  ```
- **Expected Result**: Cada tendência exibe badge correspondente à sua faixa de score
- **Acceptance Criteria**: Maps to FR-003

---

### TS-US01-003: Tags de tópico são coloridas e consistentes

- **Type**: Alternative Path
- **Preconditions**: Tendências de pelo menos dois tópicos distintos no dashboard
- **Gherkin**:
  ```gherkin
  Scenario: Tags de tópico usam cores distintas por categoria
    Given que o dashboard exibe tendências dos tópicos "Infraestrutura" e "Regulamentação"
    When o analista visualiza os cards
    Then cada tópico é representado por uma cor distinta e consistente
    And todas as tendências do mesmo tópico exibem a mesma cor de tag
  ```
- **Expected Result**: Cores consistentes por tópico em todo o dashboard
- **Acceptance Criteria**: Maps to FR-002, NFR-003

---

## User Story 2 — Visualizar Tendências Aguardando Avaliação (P1)

> Source: spec.md → User Story 2

### TS-US02-001: Seção "Aguardando avaliação" exibe backlog ordenado por data

- **Type**: Happy Path
- **Preconditions**: Existem tendências coletadas sem score registrado
- **Gherkin**:
  ```gherkin
  Scenario: Backlog de tendências não avaliadas visível no dashboard
    Given que existem tendências coletadas sem score
    When o analista acessa o dashboard
    Then a seção "Aguardando avaliação" está visível
    And as tendências sem score aparecem ordenadas por data de coleta decrescente
    And essas tendências não aparecem no ranking principal
  ```
- **Expected Result**: Seção visível com backlog ordenado; itens ausentes do ranking principal
- **Acceptance Criteria**: Maps to FR-004, FR-005

---

### TS-US02-002: Seção "Aguardando avaliação" oculta sem pendências

- **Type**: Alternative Path
- **Preconditions**: Todas as tendências coletadas possuem score registrado
- **Gherkin**:
  ```gherkin
  Scenario: Dashboard sem backlog pendente
    Given que todas as tendências coletadas possuem score registrado
    When o analista acessa o dashboard
    Then a seção "Aguardando avaliação" não exibe itens pendentes
    And exibe mensagem ou estado indicando que não há itens aguardando avaliação
  ```
- **Expected Result**: Seção vazia ou oculta; sem itens pendentes exibidos
- **Acceptance Criteria**: Maps to FR-004

---

### TS-US02-003: Tendência avaliada migra para o ranking automaticamente

- **Type**: Alternative Path
- **Preconditions**: Tendência está na seção "Aguardando avaliação"; analista acessa seu detalhe e avalia
- **Gherkin**:
  ```gherkin
  Scenario: Tendência avaliada migra do backlog para o ranking
    Given que uma tendência está na seção "Aguardando avaliação"
    When o analista avalia essa tendência e registra o score
    And retorna ao dashboard
    Then a tendência não aparece mais na seção "Aguardando avaliação"
    And aparece no ranking principal na posição correspondente ao seu score
  ```
- **Expected Result**: Tendência removida do backlog; inserida no ranking na posição correta
- **Acceptance Criteria**: Maps to FR-007

---

## User Story 3 — Filtrar Ranking por Tópico (P1)

> Source: spec.md → User Story 3

### TS-US03-001: Filtro por tópico afeta ranking e backlog simultaneamente

- **Type**: Happy Path
- **Preconditions**: Dashboard com tendências de múltiplos tópicos, avaliadas e não avaliadas
- **Gherkin**:
  ```gherkin
  Scenario: Filtrar dashboard por tópico específico
    Given que o dashboard exibe tendências dos tópicos "Infraestrutura" e "Regulamentação"
    When o analista seleciona o filtro de tópico "Regulamentação"
    Then o ranking exibe apenas tendências avaliadas do tópico "Regulamentação"
    And a seção "Aguardando avaliação" exibe apenas itens do tópico "Regulamentação"
    And tendências de outros tópicos não aparecem em nenhuma seção
  ```
- **Expected Result**: Ambas as seções filtradas pelo tópico selecionado
- **Acceptance Criteria**: Maps to FR-006

---

### TS-US03-002: Remover filtro restaura visão completa

- **Type**: Alternative Path
- **Preconditions**: Filtro de tópico ativo no dashboard
- **Gherkin**:
  ```gherkin
  Scenario: Remoção do filtro de tópico restaura dashboard completo
    Given que o analista aplicou filtro por tópico "Infraestrutura"
    When remove o filtro ativo
    Then o dashboard volta a exibir tendências de todos os tópicos
    And o ranking e a seção "Aguardando avaliação" exibem todos os itens disponíveis
  ```
- **Expected Result**: Dashboard sem filtro exibe todos os itens de todos os tópicos
- **Acceptance Criteria**: Maps to FR-006

---

### TS-US03-003: Filtro por tópico sem tendências avaliadas exibe ranking vazio

- **Type**: Negative / Error
- **Preconditions**: Tópico selecionado possui itens apenas no backlog (sem avaliados)
- **Gherkin**:
  ```gherkin
  Scenario: Tópico sem tendências avaliadas gera ranking vazio
    Given que o analista seleciona tópico que tem apenas itens no backlog
    When o filtro é aplicado
    Then o ranking principal exibe mensagem de ausência de tendências avaliadas para esse tópico
    And a seção "Aguardando avaliação" exibe os itens pendentes do tópico
  ```
- **Expected Result**: Ranking vazio com mensagem; backlog populado com itens do tópico
- **Acceptance Criteria**: Maps to FR-006

---

## User Story 4 — Visualizar Detalhe Completo de uma Tendência (P1)

> Source: spec.md → User Story 4

### TS-US04-001: Página de detalhe exibe todos os campos obrigatórios

- **Type**: Happy Path
- **Preconditions**: Tendência coletada com todos os campos preenchidos; analista clica no card do dashboard
- **Gherkin**:
  ```gherkin
  Scenario: Detalhe de tendência exibe conteúdo completo
    Given que o analista clica em uma tendência no dashboard
    When a página de detalhe é carregada
    Then exibe título, resumo completo, nome da fonte, tópico e data de coleta
    And exibe link clicável para a URL da fonte original
  ```
- **Expected Result**: Todos os campos visíveis; link funcional para a fonte original
- **Acceptance Criteria**: Maps to FR-008

---

### TS-US04-002: Link da fonte original abre em nova aba

- **Type**: Alternative Path
- **Preconditions**: Tendência com URL de fonte válida; analista na página de detalhe
- **Gherkin**:
  ```gherkin
  Scenario: Link da fonte original não fecha a plataforma
    Given que o analista está na página de detalhe de uma tendência
    When clica no link da fonte original
    Then o link abre em nova aba do navegador
    And a página de detalhe permanece aberta na aba original
  ```
- **Expected Result**: Fonte original em nova aba; plataforma preservada na aba original
- **Acceptance Criteria**: Maps to FR-008

---

### TS-US04-003: Detalhe de tendência avaliada exibe score atual e formulário pré-preenchido

- **Type**: Alternative Path
- **Preconditions**: Tendência com score já registrado
- **Gherkin**:
  ```gherkin
  Scenario: Detalhe de tendência já avaliada mostra score e formulário preenchido
    Given que o analista acessa o detalhe de uma tendência com score registrado
    When a página é carregada
    Then o score atual, badge de nível, origem da avaliação e notas são exibidos
    And o formulário de avaliação está pré-preenchido com os valores do score atual
  ```
- **Expected Result**: Score visível com badge e origem; formulário pré-preenchido para possível reavaliação
- **Acceptance Criteria**: Maps to FR-010, FR-011

---

## User Story 5 — Avaliar Tendência pelo Formulário Inline na Página de Detalhe (P1)

> Source: spec.md → User Story 5

### TS-US05-001: Formulário inline disponível na mesma página do conteúdo

- **Type**: Happy Path
- **Preconditions**: Analista na página de detalhe de tendência não avaliada
- **Gherkin**:
  ```gherkin
  Scenario: Formulário de avaliação co-localizado com o conteúdo da tendência
    Given que o analista está na página de detalhe de uma tendência não avaliada
    When a página é carregada
    Then o conteúdo completo da tendência e o formulário de avaliação são visíveis na mesma página
    And o formulário exibe os 5 critérios, campo de notas e score total em tempo real
  ```
- **Expected Result**: Conteúdo e formulário visíveis sem navegação adicional
- **Acceptance Criteria**: Maps to FR-009

---

### TS-US05-002: Score salvo no detalhe reflete no dashboard sem recarregamento manual

- **Type**: Alternative Path
- **Preconditions**: Analista avaliou tendência pelo formulário inline
- **Gherkin**:
  ```gherkin
  Scenario: Avaliação inline atualiza dashboard ao retornar
    Given que o analista preencheu e salvou o formulário de avaliação na página de detalhe
    When retorna ao dashboard
    Then a tendência avaliada aparece no ranking principal na posição correta
    And não aparece mais na seção "Aguardando avaliação"
  ```
- **Expected Result**: Dashboard atualizado; tendência posicionada corretamente no ranking
- **Acceptance Criteria**: Maps to FR-007, FR-013

---

### TS-US05-003: Botão "Auto-score com IA" disponível no detalhe quando configurado

- **Type**: Alternative Path
- **Preconditions**: Integração com IA configurada; analista no detalhe de uma tendência
- **Gherkin**:
  ```gherkin
  Scenario: Botão de auto-score disponível no formulário inline
    Given que a integração com IA está configurada
    And o analista está na página de detalhe de uma tendência
    When visualiza o formulário de avaliação
    Then o botão "Auto-score com IA" está visível no formulário inline
    And ao clicar, preenche o formulário com sugestões sem salvar automaticamente
  ```
- **Expected Result**: Botão visível e funcional; comportamento igual ao especificado em 003-trend-scoring
- **Acceptance Criteria**: Maps to FR-012

---

## Edge Cases

> Derived from spec.md → Edge Cases section

### TS-EC-001: Dashboard acessado sem nenhuma tendência coletada

- **Type**: Edge Case
- **Preconditions**: Base de dados sem nenhuma tendência coletada
- **Gherkin**:
  ```gherkin
  Scenario: Estado inicial sem dados
    Given que nenhuma tendência foi coletada ainda
    When o analista acessa o dashboard
    Then o ranking principal exibe estado vazio com mensagem orientadora
    And a seção "Aguardando avaliação" também exibe estado vazio
    And nenhum erro técnico é exposto
  ```
- **Expected Result**: Estados vazios tratados com mensagens orientadoras; sem erro
- **Acceptance Criteria**: Maps to FR-001, FR-004

---

### TS-EC-002: Dashboard com tendências coletadas mas nenhuma avaliada

- **Type**: Edge Case
- **Preconditions**: Tendências coletadas existem; nenhuma possui score
- **Gherkin**:
  ```gherkin
  Scenario: Ranking vazio com backlog populado
    Given que existem tendências coletadas mas nenhuma possui score
    When o analista acessa o dashboard
    Then o ranking principal exibe mensagem indicando ausência de tendências avaliadas
    And a seção "Aguardando avaliação" exibe todas as tendências coletadas
  ```
- **Expected Result**: Ranking vazio com mensagem; backlog populado
- **Acceptance Criteria**: Maps to FR-001, FR-004, FR-005

---

### TS-EC-003: URL de detalhe com ID inexistente

- **Type**: Edge Case
- **Preconditions**: Analista acessa diretamente uma URL de detalhe com ID que não existe na base
- **Gherkin**:
  ```gherkin
  Scenario: Detalhe de tendência não encontrada
    Given que o analista acessa a URL de detalhe de uma tendência com ID inexistente
    When a página tenta carregar
    Then é exibida página de "não encontrado" com mensagem clara
    And há link de retorno ao dashboard
  ```
- **Expected Result**: Página 404 amigável com link de retorno; sem erro técnico exposto
- **Acceptance Criteria**: Maps to FR-014

---

### TS-EC-004: Tendência sem resumo ou URL na página de detalhe

- **Type**: Edge Case
- **Preconditions**: Tendência coletada com campos opcionais ausentes (sem resumo ou sem URL)
- **Gherkin**:
  ```gherkin
  Scenario: Detalhe de tendência com campos ausentes
    Given que uma tendência foi coletada sem resumo ou sem URL de fonte
    When o analista acessa sua página de detalhe
    Then a página carrega normalmente
    And campos ausentes são sinalizados visualmente (ex: "Resumo não disponível")
    And o formulário de avaliação continua disponível
  ```
- **Expected Result**: Página funcional; campos ausentes indicados visualmente; formulário disponível
- **Acceptance Criteria**: Maps to FR-008

---

## Non-Functional Requirements

> Derived from spec.md → Non-Functional Requirements

### TS-NFR-001: Dashboard carrega em menos de 2 segundos

- **Type**: Performance
- **Preconditions**: Base de dados com volume representativo de tendências; dashboard acessado
- **Gherkin**:
  ```gherkin
  Scenario: Performance do carregamento do dashboard
    Given que a base contém tendências avaliadas e não avaliadas
    When o analista acessa o dashboard
    Then o ranking e a seção "Aguardando avaliação" são exibidos em menos de 2 segundos
  ```
- **Expected Result**: Tempo de carregamento < 2 segundos em condições normais
- **Acceptance Criteria**: Maps to NFR-001

---

### TS-NFR-002: Página de detalhe carrega em menos de 2 segundos

- **Type**: Performance
- **Preconditions**: Tendência com todos os campos; analista clica no card do dashboard
- **Gherkin**:
  ```gherkin
  Scenario: Performance do carregamento da página de detalhe
    Given que o analista clica em uma tendência no dashboard
    When a página de detalhe é carregada
    Then o conteúdo completo e o formulário de avaliação são exibidos em menos de 2 segundos
  ```
- **Expected Result**: Tempo de carregamento < 2 segundos
- **Acceptance Criteria**: Maps to NFR-002
