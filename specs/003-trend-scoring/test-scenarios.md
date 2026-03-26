# Test Scenarios: Trend Scoring

**Feature Branch**: `001-trend-collection`
**Feature Directory**: `specs/003-trend-scoring`
**Generated from**: `spec.md`
**Total scenarios**: 22 | US01: 3 | US02: 4 | US03: 4 | US04: 3 | Edge Cases: 6 | NFR: 2

---

## User Story 1 — Avaliar Tendência Manualmente pelos 5 Critérios (P1)

> Source: spec.md → User Story 1

### TS-US01-001: Score manual salvo com todos os critérios preenchidos

- **Type**: Happy Path
- **Preconditions**: Analista acessa página de detalhe de tendência não avaliada; todos os 5 critérios disponíveis
- **Gherkin**:
  ```gherkin
  Scenario: Avaliação manual completa com todos os critérios
    Given que o analista está na página de detalhe de uma tendência não avaliada
    When preenche valores de 1 a 5 para Maturidade, Aplicabilidade, Impacto Competitivo, Alinhamento Estratégico e Complexidade de Adoção
    And confirma o registro
    Then o score total calculado é salvo junto à tendência
    And o registro indica origem "manual"
    And a tendência passa a exibir seu score na listagem
  ```
- **Expected Result**: Score salvo com origem "manual"; tendência aparece como avaliada na listagem
- **Acceptance Criteria**: Maps to FR-001, FR-002, FR-004, FR-008

---

### TS-US01-002: Score manual salvo com notas qualitativas

- **Type**: Alternative Path
- **Preconditions**: Analista com 5 critérios preenchidos e texto no campo de notas
- **Gherkin**:
  ```gherkin
  Scenario: Avaliação com notas qualitativas
    Given que o analista preencheu os 5 critérios de avaliação
    And digitou observações no campo de notas
    When confirma o registro
    Then o score e as notas são salvos juntos
    And as notas ficam visíveis na página de detalhe da tendência
  ```
- **Expected Result**: Score e notas persistidos; notas visíveis no detalhe
- **Acceptance Criteria**: Maps to FR-006, FR-008

---

### TS-US01-003: Salvamento bloqueado com critérios incompletos

- **Type**: Negative / Error
- **Preconditions**: Analista preencheu apenas parte dos critérios
- **Gherkin**:
  ```gherkin
  Scenario: Tentativa de salvar com critérios obrigatórios faltando
    Given que o analista preencheu apenas 3 dos 5 critérios
    When tenta confirmar o registro do score
    Then o sistema impede o salvamento
    And indica quais critérios ainda precisam ser preenchidos
    And nenhum score é registrado
  ```
- **Expected Result**: Salvamento bloqueado; indicação visual dos critérios pendentes; base não modificada
- **Acceptance Criteria**: Maps to FR-007

---

## User Story 2 — Visualizar Score Total Calculado em Tempo Real (P1)

> Source: spec.md → User Story 2

### TS-US02-001: Score total atualiza imediatamente ao alterar critério

- **Type**: Happy Path
- **Preconditions**: Analista com formulário de avaliação aberto e ao menos um critério preenchido
- **Gherkin**:
  ```gherkin
  Scenario: Atualização em tempo real do score total
    Given que o analista está preenchendo o formulário de avaliação
    And já possui ao menos um critério preenchido
    When altera o valor de qualquer critério
    Then o score total calculado é atualizado imediatamente
    And o novo valor reflete a fórmula ponderada com todos os critérios atuais
  ```
- **Expected Result**: Score total atualizado em menos de 200ms após alteração; valor matematicamente correto
- **Acceptance Criteria**: Maps to FR-004, FR-005, NFR-001

---

### TS-US02-002: Complexidade de Adoção invertida refletida corretamente no score

- **Type**: Alternative Path
- **Preconditions**: Analista preenchendo formulário; Complexidade de Adoção disponível
- **Gherkin**:
  ```gherkin
  Scenario: Critério invertido contribui corretamente para o score total
    Given que o analista está preenchendo o formulário
    When define Complexidade de Adoção como 5 (muito complexa)
    Then o score total reflete que o valor 5 neste critério contribui menos para o total do que o valor 1
    And a descrição do critério indica claramente que a escala é invertida
  ```
- **Expected Result**: Valor 5 em Complexidade de Adoção produz score total menor do que valor 1 no mesmo critério, mantendo os demais iguais
- **Acceptance Criteria**: Maps to FR-003, FR-004

---

### TS-US02-003: Score total indeterminado com formulário vazio

- **Type**: Alternative Path
- **Preconditions**: Analista acabou de abrir o formulário de avaliação sem nenhum valor preenchido
- **Gherkin**:
  ```gherkin
  Scenario: Formulário sem critérios preenchidos
    Given que o analista acabou de abrir o formulário de avaliação
    And nenhum critério foi preenchido
    Then o score total exibido é zero ou indicado como indeterminado
    And o botão de salvar está desabilitado
  ```
- **Expected Result**: Score não calculado exibido; botão salvar inativo
- **Acceptance Criteria**: Maps to FR-005, FR-007

---

### TS-US02-004: Fórmula ponderada produz resultado matematicamente correto

- **Type**: Alternative Path
- **Preconditions**: Analista preenche todos os critérios com valores conhecidos
- **Gherkin**:
  ```gherkin
  Scenario: Verificação da fórmula com valores conhecidos
    Given que o analista define Maturidade=3, Aplicabilidade=4, Impacto=5, Alinhamento=2, Complexidade=1
    When o sistema calcula o score total
    Then o score exibido é (3×0,20)+(4×0,30)+(5×0,25)+(2×0,15)+(1×0,10) = 0,60+1,20+1,25+0,30+0,10 = 3,45
  ```
- **Expected Result**: Score total = 3,45 para os valores informados
- **Acceptance Criteria**: Maps to FR-004

---

## User Story 3 — Auto-avaliar Tendência com Sugestão de IA (P2)

> Source: spec.md → User Story 3

### TS-US03-001: Auto-score preenche formulário sem salvar automaticamente

- **Type**: Happy Path
- **Preconditions**: Integração com IA configurada; analista na página de detalhe de uma tendência
- **Gherkin**:
  ```gherkin
  Scenario: Auto-score preenche formulário com sugestão da IA
    Given que a integração com IA está configurada
    And o analista está na página de detalhe de uma tendência
    When clica no botão "Auto-score com IA"
    Then o formulário é preenchido com valores sugeridos para os 5 critérios
    And o score total calculado é exibido com base nos valores sugeridos
    And o score não é salvo automaticamente
    And o analista pode editar os valores antes de salvar
  ```
- **Expected Result**: Formulário preenchido; score calculado exibido; nenhuma persistência automática
- **Acceptance Criteria**: Maps to FR-009, FR-010

---

### TS-US03-002: Score ajustado após sugestão da IA registra origem "manual"

- **Type**: Alternative Path
- **Preconditions**: Formulário preenchido via auto-score; analista altera ao menos um valor
- **Gherkin**:
  ```gherkin
  Scenario: Analista ajusta sugestão da IA e salva
    Given que o formulário foi preenchido via auto-score
    When o analista altera ao menos um valor sugerido e salva
    Then o score registrado reflete os valores ajustados
    And a origem do score é registrada como "manual"
  ```
- **Expected Result**: Score salvo com valores ajustados; origem "manual"
- **Acceptance Criteria**: Maps to FR-008, FR-011

---

### TS-US03-003: Score aceito sem modificação registra origem "llm"

- **Type**: Alternative Path
- **Preconditions**: Formulário preenchido via auto-score; analista não altera nenhum valor
- **Gherkin**:
  ```gherkin
  Scenario: Analista aceita sugestão da IA sem modificações e salva
    Given que o formulário foi preenchido via auto-score
    And o analista não alterou nenhum valor sugerido
    When salva o score
    Then o score registrado reflete os valores sugeridos pela IA
    And a origem do score é registrada como "llm"
  ```
- **Expected Result**: Score salvo com valores da IA; origem "llm"
- **Acceptance Criteria**: Maps to FR-008, FR-012

---

### TS-US03-004: Botão "Auto-score com IA" ausente sem integração configurada

- **Type**: Negative / Error
- **Preconditions**: Integração com IA não configurada
- **Gherkin**:
  ```gherkin
  Scenario: Formulário sem integração de IA configurada
    Given que a integração com IA não está configurada
    When o analista acessa o formulário de avaliação de qualquer tendência
    Then o botão "Auto-score com IA" não é exibido
    And o formulário manual está disponível normalmente
  ```
- **Expected Result**: Botão ausente; formulário manual funcional
- **Acceptance Criteria**: Maps to FR-009

---

## User Story 4 — Identificar Origem de Cada Avaliação (P2)

> Source: spec.md → User Story 4

### TS-US04-001: Score manual exibe origem correta

- **Type**: Happy Path
- **Preconditions**: Tendência com score registrado manualmente
- **Gherkin**:
  ```gherkin
  Scenario: Origem de score manual visível na tendência
    Given que um analista registrou score preenchendo o formulário manualmente
    When a tendência é visualizada no detalhe
    Then a origem do score é exibida como avaliação manual
  ```
- **Expected Result**: Indicação "Avaliação manual" visível na página de detalhe
- **Acceptance Criteria**: Maps to FR-014

---

### TS-US04-002: Score gerado por IA exibe origem correta

- **Type**: Alternative Path
- **Preconditions**: Tendência com score registrado via auto-score sem modificações
- **Gherkin**:
  ```gherkin
  Scenario: Origem de score por IA visível na tendência
    Given que um analista salvou score sem modificar valores sugeridos pela IA
    When a tendência é visualizada no detalhe
    Then a origem do score é exibida como avaliação por IA
  ```
- **Expected Result**: Indicação "Avaliado por IA" visível na página de detalhe
- **Acceptance Criteria**: Maps to FR-014

---

### TS-US04-003: Reavaliação de tendência pré-carrega score atual

- **Type**: Alternative Path
- **Preconditions**: Tendência já possui score registrado
- **Gherkin**:
  ```gherkin
  Scenario: Analista reavalía tendência já pontuada
    Given que uma tendência já possui score registrado com valores definidos
    When o analista abre o formulário de avaliação dessa tendência
    Then o formulário é pré-preenchido com os valores do score atual
    And o analista pode alterar os valores e salvar uma nova avaliação
  ```
- **Expected Result**: Formulário pré-preenchido com score existente; reavaliação possível
- **Acceptance Criteria**: Maps to FR-013

---

## Edge Cases

> Derived from spec.md → Edge Cases section

### TS-EC-001: IA retorna valor fora do intervalo 1-5

- **Type**: Edge Case
- **Preconditions**: Integração com IA configurada; IA retorna valor inválido (ex: 0 ou 6) para algum critério
- **Gherkin**:
  ```gherkin
  Scenario: Sugestão da IA contém valor inválido
    Given que a integração com IA está configurada
    When o analista clica em "Auto-score com IA"
    And a IA retorna um valor fora do intervalo 1-5 para algum critério
    Then o sistema descarta a sugestão inválida
    And exibe mensagem informando que a sugestão não pôde ser aplicada
    And o formulário permanece editável para preenchimento manual
  ```
- **Expected Result**: Sugestão inválida descartada; analista informado; formulário disponível para uso manual
- **Acceptance Criteria**: Maps to FR-010

---

### TS-EC-002: IA indisponível no momento do auto-score

- **Type**: Edge Case
- **Preconditions**: Integração com IA configurada; serviço de IA inacessível
- **Gherkin**:
  ```gherkin
  Scenario: Serviço de IA indisponível durante auto-score
    Given que a integração com IA está configurada
    And o serviço de IA está inacessível no momento
    When o analista clica em "Auto-score com IA"
    Then o sistema exibe mensagem de erro indicando indisponibilidade da IA
    And o formulário permanece editável para preenchimento manual
    And nenhum valor é alterado no formulário
  ```
- **Expected Result**: Erro exibido; formulário preservado para uso manual; nenhuma modificação indesejada
- **Acceptance Criteria**: Maps to FR-010, NFR-002

---

### TS-EC-003: Analista fecha formulário sem salvar

- **Type**: Edge Case
- **Preconditions**: Analista modificou valores no formulário mas não salvou
- **Gherkin**:
  ```gherkin
  Scenario: Formulário fechado sem confirmação de salvamento
    Given que o analista modificou valores nos critérios do formulário
    When fecha a página ou navega para outra sem salvar
    Then nenhuma alteração é persistida na base de dados
    And o score anterior da tendência (se existia) permanece inalterado
  ```
- **Expected Result**: Nenhuma persistência de dados não confirmados
- **Acceptance Criteria**: Maps to FR-007

---

### TS-EC-004: Todos os critérios com valor mínimo (1)

- **Type**: Edge Case
- **Preconditions**: Analista define todos os 5 critérios como 1
- **Gherkin**:
  ```gherkin
  Scenario: Score mínimo possível com todos os critérios em 1
    Given que o analista define todos os critérios com valor 1
    When o sistema calcula o score total
    Then o score total calculado é 1,00
    And o salvamento é aceito normalmente
  ```
- **Expected Result**: Score = 1,00; aceito e salvo sem erro
- **Acceptance Criteria**: Maps to FR-002, FR-004, NFR-003

---

### TS-EC-005: Todos os critérios com valor máximo (5)

- **Type**: Edge Case
- **Preconditions**: Analista define todos os 5 critérios como 5
- **Gherkin**:
  ```gherkin
  Scenario: Score máximo possível com todos os critérios em 5
    Given que o analista define todos os critérios com valor 5
    When o sistema calcula o score total
    Then o score total calculado é 5,00
    And o salvamento é aceito normalmente
  ```
- **Expected Result**: Score = 5,00; aceito e salvo sem erro
- **Acceptance Criteria**: Maps to FR-002, FR-004, NFR-003

---

### TS-EC-006: Auto-score com timeout excedido

- **Type**: Edge Case
- **Preconditions**: Integração com IA configurada; IA demora mais de 10 segundos para responder
- **Gherkin**:
  ```gherkin
  Scenario: Auto-score excede tempo limite de resposta
    Given que o analista clicou em "Auto-score com IA"
    And a IA não retorna resposta dentro de 10 segundos
    Then o sistema cancela a operação e exibe mensagem de timeout
    And o formulário permanece editável para preenchimento manual
  ```
- **Expected Result**: Timeout exibido após 10s; formulário disponível para uso manual
- **Acceptance Criteria**: Maps to NFR-002

---

## Non-Functional Requirements

> Derived from spec.md → Non-Functional Requirements

### TS-NFR-001: Score total atualizado em menos de 200ms

- **Type**: Performance
- **Preconditions**: Formulário de avaliação aberto com critérios parcialmente preenchidos
- **Gherkin**:
  ```gherkin
  Scenario: Responsividade do cálculo em tempo real
    Given que o analista está preenchendo o formulário de avaliação
    When altera o valor de qualquer critério
    Then o score total exibido é atualizado em menos de 200ms
  ```
- **Expected Result**: Atualização do score total visível em menos de 200ms após interação
- **Acceptance Criteria**: Maps to NFR-001

---

### TS-NFR-002: Score total sempre dentro do intervalo 1,00–5,00

- **Type**: Data Integrity
- **Preconditions**: Qualquer combinação de valores válidos (1-5) nos 5 critérios
- **Gherkin**:
  ```gherkin
  Scenario: Integridade do score para qualquer combinação válida de critérios
    Given que o analista preenche todos os 5 critérios com valores entre 1 e 5
    When o score é calculado e salvo
    Then o score total registrado está sempre entre 1,00 e 5,00 inclusive
  ```
- **Expected Result**: Score total sempre no intervalo [1,00; 5,00] para entradas válidas
- **Acceptance Criteria**: Maps to NFR-003
