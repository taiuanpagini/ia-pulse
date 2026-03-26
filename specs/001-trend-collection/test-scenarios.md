# Test Scenarios: Trend Collection

**Feature Branch**: `001-trend-collection`
**Generated from**: `spec.md`
**Total scenarios**: 18 | US01: 4 | US02: 3 | US03: 3 | US04: 3 | Edge Cases: 4 | NFR: 1

---

## User Story 1 — Coleta Automática Diária de Tendências (P1)

> Source: spec.md → User Story 1

### TS-US01-001: Coleta programada executa e registra itens de múltiplas fontes

- **Type**: Happy Path
- **Preconditions**: Base de dados acessível; todas as fontes configuradas disponíveis; job de coleta acionado no horário programado
- **Gherkin**:
  ```gherkin
  Scenario: Coleta automática bem-sucedida com todas as fontes disponíveis
    Given que o job de coleta é acionado no horário programado (07:00 UTC)
    And todas as fontes configuradas estão disponíveis
    When o sistema processa todas as fontes
    Then novos itens são registrados na base de dados
    And cada item possui título, resumo, URL de origem, fonte e tópico preenchidos
    And cada item possui data de coleta registrada
  ```
- **Expected Result**: Itens de ao menos 10 fontes distintas aparecem na base de dados com todos os campos obrigatórios preenchidos
- **Acceptance Criteria**: Maps to FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007

---

### TS-US01-002: Coleta acionada manualmente por operador com credencial válida

- **Type**: Alternative Path
- **Preconditions**: Operador possui credencial válida; base de dados acessível
- **Gherkin**:
  ```gherkin
  Scenario: Operador aciona coleta manualmente fora do horário programado
    Given que um operador possui credencial válida
    When o operador aciona o endpoint de coleta manualmente
    Then o sistema executa a coleta normalmente
    And retorna confirmação com número de itens coletados por fonte
  ```
- **Expected Result**: Coleta executada com sucesso; resposta contém contagem de itens por fonte
- **Acceptance Criteria**: Maps to FR-009, FR-010, FR-012

---

### TS-US01-003: Tentativa de acionar coleta sem credencial válida é bloqueada

- **Type**: Negative / Error
- **Preconditions**: Requisição sem credencial ou com credencial incorreta
- **Gherkin**:
  ```gherkin
  Scenario: Requisição ao endpoint de coleta sem credencial
    Given que uma requisição chega ao endpoint de coleta
    And a requisição não contém credencial válida
    When o sistema avalia a requisição
    Then o acesso é negado com status HTTP 401
    And nenhuma coleta é executada
  ```
- **Expected Result**: HTTP 401 retornado; base de dados não modificada
- **Acceptance Criteria**: Maps to FR-010, NFR-003

---

### TS-US01-004: Itens coletados têm tópico corretamente associado por fonte

- **Type**: Alternative Path
- **Preconditions**: Base de dados acessível; coleta executada
- **Gherkin**:
  ```gherkin
  Scenario: Itens de fontes de infraestrutura são associados ao tópico correto
    Given que o job de coleta é executado
    When itens do NVIDIA Developer Blog e Hugging Face Blog são coletados
    Then esses itens são associados ao tópico "Infraestrutura"

  Scenario: Itens de fontes de regulamentação são associados ao tópico correto
    Given que o job de coleta é executado
    When itens do EUR-Lex e ANPD são coletados
    Then esses itens são associados ao tópico "Regulamentação"
  ```
- **Expected Result**: Tópico de cada item reflete a categoria da fonte de origem
- **Acceptance Criteria**: Maps to FR-007

---

## User Story 2 — Isolamento de Falhas por Fonte (P1)

> Source: spec.md → User Story 2

### TS-US02-001: Falha em uma fonte não interrompe coleta das demais

- **Type**: Happy Path (com falha isolada)
- **Preconditions**: Uma das fontes está indisponível (retorna erro); as demais estão disponíveis
- **Gherkin**:
  ```gherkin
  Scenario: Uma fonte falha durante a coleta
    Given que o job de coleta é acionado
    And uma das fontes configuradas está indisponível
    When o sistema processa as fontes
    Then itens das fontes disponíveis são coletados e registrados normalmente
    And o erro da fonte indisponível é registrado com nome da fonte e descrição do erro
    And o resultado final indica quais fontes tiveram sucesso e quais falharam
  ```
- **Expected Result**: Itens de todas as fontes disponíveis são coletados; erro da fonte indisponível é registrado sem interromper o processo
- **Acceptance Criteria**: Maps to FR-011, FR-012

---

### TS-US02-002: Resultado da execução reporta status por fonte

- **Type**: Alternative Path
- **Preconditions**: Coleta executada com mix de fontes com sucesso e falha
- **Gherkin**:
  ```gherkin
  Scenario: Execução com fontes mistas (sucesso e falha)
    Given que o job de coleta é executado
    And algumas fontes retornam itens com sucesso
    And outras fontes retornam erros
    When a execução é concluída
    Then o log de execução contém uma entrada por fonte
    And cada entrada indica status, quantidade de itens coletados e erro (quando aplicável)
  ```
- **Expected Result**: Log estruturado com resultado por fonte: fonte, status, itens coletados, mensagem de erro se falhou
- **Acceptance Criteria**: Maps to FR-012, NFR-004

---

### TS-US02-003: Todas as fontes funcionam normalmente

- **Type**: Happy Path
- **Preconditions**: Todas as fontes disponíveis; base de dados acessível
- **Gherkin**:
  ```gherkin
  Scenario: Coleta sem falhas em nenhuma fonte
    Given que o job de coleta é acionado
    And todas as fontes configuradas estão disponíveis e respondem normalmente
    When o sistema processa todas as fontes
    Then itens de todas as fontes são coletados e registrados
    And nenhum erro é reportado no log de execução
  ```
- **Expected Result**: Log indica sucesso em 100% das fontes; itens de todas as fontes presentes na base
- **Acceptance Criteria**: Maps to FR-011, FR-012, NFR-002

---

## User Story 3 — Deduplicação de Conteúdo (P2)

> Source: spec.md → User Story 3

### TS-US03-001: Item com URL já existente não é inserido novamente

- **Type**: Happy Path
- **Preconditions**: Item com determinada URL já existe na base de dados; coleta executada novamente coletando a mesma URL
- **Gherkin**:
  ```gherkin
  Scenario: Coleta retorna item com URL já presente na base de dados
    Given que um item com URL "https://example.com/paper-x" já existe na base de dados
    When o sistema coleta novamente um item com a mesma URL
    Then o item duplicado não é inserido na base de dados
    And o item existente permanece sem modificações
    And a contagem de novos itens da execução não inclui o duplicado
  ```
- **Expected Result**: Contagem de itens na base não aumenta para aquela URL; item existente preservado
- **Acceptance Criteria**: Maps to FR-008

---

### TS-US03-002: Duas execuções consecutivas não duplicam o conteúdo

- **Type**: Alternative Path
- **Preconditions**: Primeira execução completa realizada; fontes retornam os mesmos itens na segunda execução
- **Gherkin**:
  ```gherkin
  Scenario: Segunda execução do job com mesmas fontes
    Given que o job de coleta foi executado com sucesso
    And os itens foram registrados na base de dados
    When o job de coleta é executado novamente com as mesmas fontes
    Then nenhum item duplicado é inserido
    And o total de itens na base é o mesmo que após a primeira execução (para itens em comum)
  ```
- **Expected Result**: Base de dados não contém duplicatas após duas execuções consecutivas
- **Acceptance Criteria**: Maps to FR-008

---

### TS-US03-003: Item com URL nova é inserido normalmente

- **Type**: Happy Path
- **Preconditions**: URL do item a ser coletado não existe na base de dados
- **Gherkin**:
  ```gherkin
  Scenario: Coleta de item com URL inédita
    Given que nenhum item com a URL "https://example.com/new-paper" existe na base de dados
    When o sistema coleta um item com essa URL
    Then o item é inserido na base de dados
    And a contagem de novos itens da execução inclui esse item
  ```
- **Expected Result**: Item inserido com todos os campos; contagem de novos itens incrementada
- **Acceptance Criteria**: Maps to FR-008

---

## User Story 4 — Verificação de Saúde do Sistema (P3)

> Source: spec.md → User Story 4

### TS-US04-001: Health check retorna status positivo com base de dados acessível

- **Type**: Happy Path
- **Preconditions**: Sistema em execução; base de dados acessível
- **Gherkin**:
  ```gherkin
  Scenario: Sistema operacional com base de dados conectada
    Given que o sistema está em execução
    And a base de dados está acessível
    When uma requisição GET é feita ao endpoint de saúde
    Then a resposta indica que o sistema está operacional
    And a resposta confirma que a base de dados está conectada
    And o status HTTP da resposta é 200
  ```
- **Expected Result**: HTTP 200 com payload indicando status operacional e conectividade confirmada
- **Acceptance Criteria**: Maps to FR-013, NFR-005

---

### TS-US04-002: Health check reporta falha de conectividade com a base de dados

- **Type**: Negative / Error
- **Preconditions**: Sistema em execução; base de dados inacessível
- **Gherkin**:
  ```gherkin
  Scenario: Base de dados inacessível no momento do health check
    Given que o sistema está em execução
    And a base de dados está inacessível
    When uma requisição GET é feita ao endpoint de saúde
    Then a resposta indica problema de conectividade com a base de dados
    And o status HTTP reflete a falha (ex: 503)
  ```
- **Expected Result**: HTTP 503 (ou equivalente) com payload indicando falha de conectividade
- **Acceptance Criteria**: Maps to FR-013

---

### TS-US04-003: Health check responde dentro do tempo limite

- **Type**: Performance
- **Preconditions**: Sistema em execução; base de dados acessível
- **Gherkin**:
  ```gherkin
  Scenario: Resposta do health check dentro do tempo esperado
    Given que o sistema está em execução normalmente
    When uma requisição GET é feita ao endpoint de saúde
    Then a resposta é retornada em menos de 2 segundos
  ```
- **Expected Result**: Tempo de resposta < 2 segundos em condições normais
- **Acceptance Criteria**: Maps to NFR-005

---

## Edge Cases

> Derived from spec.md → Edge Cases section

### TS-EC-001: Fonte retorna lista vazia de resultados

- **Type**: Edge Case
- **Preconditions**: Fonte configurada e acessível; porém sem novos itens para retornar
- **Gherkin**:
  ```gherkin
  Scenario: Fonte acessível mas sem conteúdo novo
    Given que o job de coleta é executado
    And uma fonte está disponível mas retorna lista vazia de resultados
    When o sistema processa essa fonte
    Then nenhum item é inserido para essa fonte
    And a fonte não é marcada como falha no log de execução
    And o resultado indica 0 itens coletados para essa fonte
  ```
- **Expected Result**: Lista vazia tratada como sucesso com 0 itens; sem erro registrado
- **Acceptance Criteria**: Maps to FR-011, FR-012

---

### TS-EC-002: Item coletado com campos obrigatórios ausentes é descartado

- **Type**: Edge Case
- **Preconditions**: Fonte retorna item sem título ou sem URL
- **Gherkin**:
  ```gherkin
  Scenario: Item da fonte sem URL é descartado
    Given que o job de coleta é executado
    And uma fonte retorna um item sem URL de origem
    When o sistema processa esse item
    Then o item é descartado e não inserido na base de dados
    And o descarte é registrado no log com identificação do item e campo ausente
  ```
- **Expected Result**: Item inválido descartado; log registra o descarte; demais itens da fonte são processados normalmente
- **Acceptance Criteria**: Maps to FR-001 a FR-006, FR-012

---

### TS-EC-003: Fonte aplica rate limiting e rejeita a requisição

- **Type**: Edge Case
- **Preconditions**: Fonte disponível mas com rate limit atingido
- **Gherkin**:
  ```gherkin
  Scenario: Fonte retorna erro de rate limiting
    Given que o job de coleta é executado
    And uma fonte rejeita a requisição por rate limiting
    When o sistema recebe o erro de rate limiting
    Then a falha é registrada no log com identificação da fonte e tipo de erro
    And a coleta das demais fontes continua normalmente
  ```
- **Expected Result**: Falha de rate limiting tratada como falha isolada da fonte; demais fontes não afetadas
- **Acceptance Criteria**: Maps to FR-011, FR-012

---

### TS-EC-004: Base de dados indisponível durante persistência dos itens

- **Type**: Edge Case
- **Preconditions**: Coleta de fontes concluída com sucesso; base de dados fica indisponível no momento da persistência
- **Gherkin**:
  ```gherkin
  Scenario: Base de dados falha durante tentativa de salvar itens coletados
    Given que o sistema coletou itens com sucesso de várias fontes
    And a base de dados se torna inacessível antes da persistência
    When o sistema tenta salvar os itens coletados
    Then o erro de conectividade com a base de dados é registrado
    And o sistema não registra sucesso parcial como completo
  ```
- **Expected Result**: Erro registrado; nenhuma persistência parcial silenciosa
- **Acceptance Criteria**: Maps to FR-012, NFR-004

---

## Non-Functional Requirements

> Derived from spec.md → Non-Functional Requirements

### TS-NFR-001: Ciclo completo de coleta conclui em menos de 10 minutos

- **Type**: Performance
- **Preconditions**: Todas as fontes disponíveis; base de dados acessível; job de coleta acionado
- **Gherkin**:
  ```gherkin
  Scenario: Duração total da coleta com todas as fontes configuradas
    Given que o job de coleta é acionado com todas as fontes configuradas
    When o sistema processa todas as fontes e persiste os resultados
    Then o ciclo completo de coleta é concluído em menos de 10 minutos
  ```
- **Expected Result**: Tempo total de execução < 600 segundos para o conjunto completo de fontes
- **Acceptance Criteria**: Maps to NFR-001
