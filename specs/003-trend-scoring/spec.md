# Feature Specification: Trend Scoring

**Feature Branch**: `001-trend-collection`
**Feature Directory**: `specs/003-trend-scoring`
**Created**: 2026-03-25
**Status**: Draft
**Input**: Avaliação de tendências de IA com score ponderado de 5 critérios (escala 1-5), modo manual e modo automático via LLM opcional, cálculo em tempo real e registro de origem do score (humano ou IA).

---

## User Scenarios & Testing

> **Regra de escrita das User Stories**: descritas em linguagem de negócio, focadas em resultado para o usuário. Sem detalhes de implementação.

---

### User Story 1 — Avaliar Tendência Manualmente pelos 5 Critérios (Priority: P1)

**As a** analista de pesquisa em IA  
**I want** preencher os 5 critérios de avaliação de uma tendência e registrar meu score com notas opcionais  
**So that** eu possa documentar minha análise de relevância e prioridade de cada tendência para a empresa

O processo de avaliação é o coração da plataforma. O analista visualiza o conteúdo completo da tendência e preenche cinco critérios ponderados que refletem diferentes dimensões de valor estratégico. A fórmula garante consistência entre avaliações de diferentes analistas. As notas opcionais permitem registrar contexto qualitativo que os números não capturam.

**Why this priority**: Sem a capacidade de avaliar manualmente, o sistema se reduz a um agregador de notícias. O scoring é o que transforma conteúdo coletado em inteligência acionável.

**Independent Test**: Pode ser testado preenchendo os 5 critérios de uma tendência, salvando e verificando que o score total calculado é registrado corretamente junto com a autoria "manual".

**Acceptance Scenarios**:

```gherkin
Scenario: Analista avalia tendência com todos os critérios preenchidos
  Given que o analista acessa a página de detalhe de uma tendência não avaliada
  When preenche valores de 1 a 5 para os cinco critérios e confirma o registro
  Then o score total calculado é salvo junto à tendência
  And o registro indica que a avaliação foi feita manualmente
  And a tendência passa a exibir seu score na listagem

Scenario: Analista registra score com notas qualitativas
  Given que o analista preenche os 5 critérios de avaliação
  And adiciona observações no campo de notas
  When confirma o registro
  Then o score e as notas são salvos juntos
  And as notas ficam visíveis na página de detalhe da tendência

Scenario: Analista tenta salvar avaliação com critérios incompletos
  Given que o analista preencheu apenas parte dos 5 critérios
  When tenta confirmar o registro
  Then o sistema impede o salvamento
  And indica quais critérios ainda precisam ser preenchidos
```

---

### User Story 2 — Visualizar Score Total Calculado em Tempo Real (Priority: P1)

**As a** analista de pesquisa em IA  
**I want** ver o score total atualizado automaticamente enquanto preencho cada critério  
**So that** eu entenda o impacto de cada avaliação antes de salvar e possa ajustar os valores conscientemente

O feedback imediato do score calculado permite ao analista calibrar sua avaliação. Sem isso, o analista só descobre o resultado após salvar, tornando o processo iterativo mais lento e menos intuitivo.

**Why this priority**: Eleva a qualidade das avaliações ao dar ao analista visibilidade do resultado antes do commit. Impacto direto na experiência de uso e na confiabilidade dos scores.

**Independent Test**: Pode ser testado alterando valores dos critérios no formulário e verificando que o score total exibido se atualiza imediatamente, refletindo a fórmula ponderada correta.

**Acceptance Scenarios**:

```gherkin
Scenario: Score total atualiza ao alterar valor de um critério
  Given que o analista está preenchendo o formulário de avaliação
  When altera o valor de qualquer um dos 5 critérios
  Then o score total calculado é atualizado imediatamente no formulário
  And o novo valor reflete a fórmula ponderada com os critérios atuais

Scenario: Score total com Complexidade de Adoção invertida
  Given que o analista está preenchendo o formulário
  When define Complexidade de Adoção como 5 (muito complexa)
  Then o score total reflete que alta complexidade contribui negativamente para a pontuação final
  And a exibição do critério indica claramente que a escala é invertida (5=pior, 1=melhor)

Scenario: Score total sem critérios preenchidos
  Given que o analista acabou de abrir o formulário de avaliação
  And nenhum critério foi preenchido ainda
  Then o score total exibido é zero ou indeterminado
  And o botão de salvar está desabilitado
```

---

### User Story 3 — Auto-avaliar Tendência com Sugestão de IA (Priority: P2)

**As a** analista de pesquisa em IA  
**I want** solicitar que a IA sugira scores para os 5 critérios com base no título e resumo da tendência  
**So that** eu acelere o processo de avaliação, usando a sugestão como ponto de partida para minha revisão final

A avaliação manual de dezenas de tendências diárias pode ser demorada. A sugestão automática da IA preenche o formulário com valores iniciais que o analista pode revisar, ajustar e então salvar. A decisão final é sempre humana — a IA só sugere, nunca salva diretamente.

**Why this priority**: Funcionalidade de produtividade importante mas não bloqueante. Depende de configuração externa (chave de API). Não afeta o fluxo manual que é o modo primário de uso.

**Independent Test**: Pode ser testado com chave de API configurada, clicando em "Auto-score com IA" em uma tendência e verificando que o formulário é preenchido com valores entre 1 e 5 para cada critério, sem salvar automaticamente.

**Acceptance Scenarios**:

```gherkin
Scenario: Auto-score preenche formulário com sugestão da IA
  Given que a integração com IA está configurada
  And o analista está na página de detalhe de uma tendência
  When clica no botão "Auto-score com IA"
  Then o formulário é preenchido com valores sugeridos pela IA para os 5 critérios
  And o score total calculado é exibido com base nos valores sugeridos
  And os valores ainda podem ser editados pelo analista antes de salvar

Scenario: Analista revisa e ajusta sugestão da IA antes de salvar
  Given que o formulário foi preenchido com sugestão da IA
  When o analista altera um ou mais valores sugeridos e salva
  Then o score registrado reflete os valores ajustados pelo analista
  And o registro indica que a avaliação foi feita manualmente (não pela IA)

Scenario: Analista aceita sugestão da IA sem alterações e salva
  Given que o formulário foi preenchido com sugestão da IA
  When o analista salva sem alterar nenhum valor
  Then o score registrado reflete os valores sugeridos pela IA
  And o registro indica que a avaliação foi gerada pela IA

Scenario: Botão "Auto-score com IA" não aparece sem integração configurada
  Given que a integração com IA não está configurada
  When o analista acessa o formulário de avaliação de qualquer tendência
  Then o botão "Auto-score com IA" não é exibido
  And o formulário manual funciona normalmente
```

---

### User Story 4 — Identificar Origem de Cada Avaliação (Priority: P2)

**As a** líder de equipe  
**I want** saber se cada score foi atribuído manualmente por um analista ou gerado por IA  
**So that** eu possa considerar a confiabilidade e o contexto de cada avaliação ao tomar decisões estratégicas

Scores gerados por IA podem ter vieses ou limitações que scores humanos não têm. Registrar a origem permite à liderança filtrar, comparar e calibrar o uso da IA ao longo do tempo.

**Why this priority**: Governança e rastreabilidade. Relevante para times que querem acompanhar a qualidade das avaliações e o impacto da IA no processo.

**Independent Test**: Pode ser testado realizando uma avaliação manual e uma com IA, depois verificando que cada uma exibe corretamente sua origem na página de detalhe e na listagem.

**Acceptance Scenarios**:

```gherkin
Scenario: Score manual exibe origem "Avaliação manual"
  Given que um analista registrou um score preenchendo o formulário manualmente
  When a tendência é visualizada na listagem ou no detalhe
  Then a origem do score é exibida como "Avaliação manual"

Scenario: Score gerado pela IA exibe origem "Avaliado por IA"
  Given que um analista salvou o score sem modificar os valores sugeridos pela IA
  When a tendência é visualizada na listagem ou no detalhe
  Then a origem do score é exibida como "Avaliado por IA"

Scenario: Score ajustado após sugestão da IA exibe origem "Avaliação manual"
  Given que um analista modificou ao menos um valor sugerido pela IA antes de salvar
  When a tendência é visualizada
  Then a origem do score é exibida como "Avaliação manual"
```

---

### Edge Cases

- O que acontece se a IA retorna um valor fora do intervalo 1-5 para algum critério? (deve ser descartado e o analista informado)
- O que acontece se a IA está indisponível no momento do auto-score? (mensagem de erro, formulário permanece editável)
- O que acontece se o analista tenta reavaliara uma tendência já pontuada? (formulário pré-preenchido com score atual para edição)
- O que acontece se o analista fecha o formulário sem salvar após modificar valores? (nenhuma alteração deve ser persistida)
- O que acontece se todos os 5 critérios são definidos com valor 1? (score total válido, mínimo possível, deve ser aceito)
- O que acontece se todos os 5 critérios são definidos com valor 5? (score total válido, máximo possível, deve ser aceito)

---

## Requirements

### Functional Requirements

- **FR-001**: O formulário de avaliação DEVE conter exatamente 5 critérios: Maturidade Tecnológica (peso 20%), Aplicabilidade Imediata (peso 30%), Impacto Competitivo (peso 25%), Alinhamento Estratégico (peso 15%) e Complexidade de Adoção (peso 10%)
- **FR-002**: Cada critério DEVE aceitar valores inteiros de 1 a 5
- **FR-003**: O critério Complexidade de Adoção DEVE ser claramente identificado como escala invertida (5=muito complexa, 1=simples)
- **FR-004**: O score total DEVE ser calculado pela fórmula: `(Maturidade×0,20) + (Aplicabilidade×0,30) + (ImpactoCompetitivo×0,25) + (AlinhamentoEstratégico×0,15) + (ComplexidadeAdoção×0,10)`
- **FR-005**: O score total calculado DEVE ser atualizado em tempo real conforme o analista altera os valores dos critérios
- **FR-006**: O formulário DEVE incluir campo de notas opcionais
- **FR-007**: O sistema DEVE impedir o salvamento do score enquanto algum critério obrigatório não estiver preenchido
- **FR-008**: Ao salvar, o sistema DEVE registrar se a avaliação foi feita manualmente ou pela IA
- **FR-009**: O botão "Auto-score com IA" DEVE ser exibido somente quando a integração com IA estiver configurada
- **FR-010**: O auto-score DEVE preencher o formulário com sugestões sem salvar automaticamente — o analista DEVE revisar e confirmar
- **FR-011**: Se o analista modificar ao menos um valor sugerido pela IA antes de salvar, a origem DEVE ser registrada como "manual"
- **FR-012**: Se o analista salvar sem modificar nenhum valor sugerido pela IA, a origem DEVE ser registrada como "llm"
- **FR-013**: Ao reavaliaar uma tendência já pontuada, o formulário DEVE ser pré-preenchido com os valores do score atual
- **FR-014**: A origem do score (manual ou IA) DEVE ser visível na página de detalhe da tendência

### Non-Functional Requirements

- **NFR-001 (Responsividade)**: O score total exibido no formulário DEVE ser atualizado em menos de 200ms após qualquer alteração de critério
- **NFR-002 (Tempo de resposta LLM)**: O auto-score DEVE retornar a sugestão da IA em menos de 10 segundos; após esse tempo, DEVE exibir mensagem de timeout
- **NFR-003 (Integridade)**: O score total registrado DEVE estar sempre no intervalo entre 1,00 e 5,00

### Key Entities

- **Score** *(subdocumento de Trend)*: contém os 5 valores dos critérios (inteiros 1-5), score total calculado (decimal), origem (`manual` ou `llm`), data de avaliação e notas opcionais
- **Trend** *(referência das features anteriores)*: uma tendência coletada que pode ou não ter um Score associado

---

## Architectural Considerations

### Caching

- **Needed?** NO
- **Justification**: Formulário de scoring é interação pontual por tendência. Sem leituras repetidas de alta frequência.

### Message Queues / Async Processing

- **Needed?** NO
- **Justification**: Salvamento do score é operação síncrona simples. Auto-score com LLM é aguardado na mesma interação.

### Event Streaming

- **Needed?** NO
- **Justification**: Sem necessidade de atualizações em tempo real entre usuários ou sistemas.

### Background Jobs / Scheduled Tasks

- **Needed?** NO
- **Justification**: Nenhuma operação agendada nesta feature. O cálculo do score é feito no cliente em tempo real.

---

## Test Scenarios

> **Test scenarios para esta feature estão documentados em [`test-scenarios.md`](./test-scenarios.md)**.
> Total de cenários: 22 | US01: 3 | US02: 4 | US03: 4 | US04: 3 | Edge Cases: 6 | NFR: 2

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Score total exibido no formulário é atualizado em menos de 200ms após qualquer alteração de critério
- **SC-002**: Fórmula ponderada produz resultado correto para qualquer combinação de valores — verificável com casos de teste conhecidos
- **SC-003**: 100% dos scores registrados possuem origem explícita ("manual" ou "llm") — nenhum score sem atribuição de origem
- **SC-004**: Formulário com critérios incompletos bloqueia salvamento em 100% das tentativas
- **SC-005**: Auto-score preenche formulário sem salvar automaticamente — confirmado em 100% dos usos
- **SC-006**: Score ajustado após sugestão da IA sempre registra origem "manual", nunca "llm"
