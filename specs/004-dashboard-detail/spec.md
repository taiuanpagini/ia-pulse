# Feature Specification: Dashboard & Trend Detail

**Feature Branch**: `001-trend-collection`
**Feature Directory**: `specs/004-dashboard-detail`
**Created**: 2026-03-25
**Status**: Draft
**Input**: Dashboard principal com ranking de tendências por score, seção "Aguardando avaliação", filtro por tópico, badges visuais de nível, e página de detalhe com conteúdo completo e formulário de scoring inline.

---

## User Scenarios & Testing

> **Regra de escrita das User Stories**: descritas em linguagem de negócio, focadas em resultado para o usuário. Sem detalhes de implementação.

---

### User Story 1 — Visualizar Ranking de Tendências Avaliadas (Priority: P1)

**As a** analista de pesquisa em IA  
**I want** ver as tendências avaliadas ordenadas por score decrescente com indicação visual do nível de cada uma  
**So that** eu identifique rapidamente quais tendências são mais relevantes e prioritárias para a empresa

O dashboard é a tela de entrada da plataforma. Ele precisa comunicar de forma imediata quais tendências merecem atenção. O ranking por score garante que o conteúdo mais relevante aparece primeiro. Os badges visuais de nível (baixo, médio, alto, crítico) permitem triagem rápida sem precisar ler os números.

**Why this priority**: É a entrega de valor central da plataforma. Sem o ranking, o sistema é apenas um repositório. O ranking transforma dados em inteligência priorizada.

**Independent Test**: Pode ser testado inserindo tendências com scores distintos e verificando que o dashboard as exibe na ordem correta, com o badge de nível correspondente a cada faixa de score.

**Acceptance Scenarios**:

```gherkin
Scenario: Dashboard exibe tendências avaliadas em ordem decrescente de score
  Given que existem tendências avaliadas com scores distintos
  When o analista acessa o dashboard
  Then as tendências avaliadas são exibidas ordenadas do maior para o menor score
  And cada card exibe título, tópico com tag colorida, fonte, data de coleta e score total destacado

Scenario: Badge de nível reflete a faixa do score
  Given que existem tendências com scores em diferentes faixas
  When essas tendências aparecem no dashboard
  Then cada tendência exibe badge visual de nível conforme sua faixa de score:
    | Faixa de score | Nível    |
    | 1,00 – 2,49   | Baixo    |
    | 2,50 – 3,49   | Médio    |
    | 3,50 – 4,49   | Alto     |
    | 4,50 – 5,00   | Crítico  |

Scenario: Tag de tópico é colorida por categoria
  Given que tendências de diferentes tópicos estão no ranking
  When o analista visualiza o dashboard
  Then cada tendência exibe a tag do seu tópico com cor distinta por categoria
```

---

### User Story 2 — Visualizar Tendências Aguardando Avaliação (Priority: P1)

**As a** analista de pesquisa em IA  
**I want** ver as tendências coletadas que ainda não foram avaliadas em uma seção dedicada  
**So that** eu saiba exatamente qual é o backlog de avaliações pendentes e possa priorizar meu trabalho

Tendências recém-coletadas entram no sistema sem score. Misturá-las com as avaliadas prejudicaria a clareza do ranking. Uma seção separada "Aguardando avaliação" exibe o backlog de forma organizada e convida o analista a agir.

**Why this priority**: Sem visibilidade do backlog, itens coletados ficam invisíveis até serem avaliados, desperdiçando o esforço de coleta.

**Independent Test**: Pode ser testado verificando que tendências sem score aparecem apenas na seção "Aguardando avaliação", ordenadas da mais recente para a mais antiga, e não no ranking principal.

**Acceptance Scenarios**:

```gherkin
Scenario: Seção "Aguardando avaliação" exibe tendências sem score
  Given que existem tendências coletadas sem score registrado
  When o analista acessa o dashboard
  Then as tendências sem score aparecem na seção "Aguardando avaliação"
  And estão ordenadas por data de coleta (mais recente primeiro)
  And não aparecem no ranking principal de tendências avaliadas

Scenario: Seção "Aguardando avaliação" fica oculta quando não há pendências
  Given que todas as tendências coletadas possuem score registrado
  When o analista acessa o dashboard
  Then a seção "Aguardando avaliação" não é exibida ou indica que não há itens pendentes

Scenario: Tendência avaliada migra do backlog para o ranking
  Given que uma tendência estava na seção "Aguardando avaliação"
  When o analista avalia essa tendência e registra o score
  Then a tendência deixa de aparecer na seção "Aguardando avaliação"
  And passa a aparecer no ranking principal na posição correspondente ao seu score
```

---

### User Story 3 — Filtrar Ranking por Tópico (Priority: P1)

**As a** analista de pesquisa em IA  
**I want** filtrar o ranking do dashboard por tópico  
**So that** eu possa focar nas tendências relevantes para o tema que estou analisando no momento, sem distrações de outras categorias

O dashboard agrega tendências de todos os temas. Um analista focado em regulamentação não precisa ver tendências de infraestrutura misturadas. O filtro por tópico é o mecanismo de foco principal do dashboard.

**Why this priority**: Filtro de tópico é o caminho mais direto para relevância contextual. Com múltiplos temas monitorados, o dashboard sem filtro se torna um mural genérico.

**Independent Test**: Pode ser testado selecionando um tópico e verificando que apenas tendências daquele tópico aparecem no ranking filtrado, incluindo a seção "Aguardando avaliação".

**Acceptance Scenarios**:

```gherkin
Scenario: Filtrar ranking por tópico específico
  Given que o dashboard exibe tendências de múltiplos tópicos
  When o analista seleciona o filtro de tópico "Regulamentação"
  Then o ranking exibe apenas tendências do tópico "Regulamentação"
  And a seção "Aguardando avaliação" também é filtrada pelo mesmo tópico
  And tendências de outros tópicos não aparecem

Scenario: Remover filtro de tópico restaura visão completa
  Given que o analista aplicou filtro por tópico
  When remove o filtro
  Then o dashboard volta a exibir tendências de todos os tópicos
```

---

### User Story 4 — Visualizar Detalhe Completo de uma Tendência (Priority: P1)

**As a** analista de pesquisa em IA  
**I want** acessar o conteúdo completo de uma tendência — título, resumo, link para a fonte original, nome da fonte, tópico e data de coleta  
**So that** eu tenha todas as informações necessárias para avaliar a relevância da tendência antes de atribuir um score

O card no dashboard mostra informações resumidas. A página de detalhe entrega o conteúdo completo, incluindo o link para o artigo/paper original para leitura aprofundada quando necessário.

**Why this priority**: Sem o detalhe, o analista precisa abrir a fonte original em outra aba para entender o conteúdo antes de avaliar. A página de detalhe centraliza tudo para acelerar o processo.

**Independent Test**: Pode ser testado clicando em uma tendência no dashboard e verificando que a página de detalhe exibe todos os campos obrigatórios e que o link para a fonte original abre corretamente.

**Acceptance Scenarios**:

```gherkin
Scenario: Página de detalhe exibe conteúdo completo da tendência
  Given que o analista clica em uma tendência no dashboard
  When a página de detalhe é carregada
  Then exibe título, resumo completo, nome da fonte, tópico, data de coleta
  And exibe link clicável para a URL da fonte original

Scenario: Link para fonte original abre em nova aba
  Given que o analista está na página de detalhe de uma tendência
  When clica no link da fonte original
  Then o link abre em nova aba sem sair da plataforma

Scenario: Página de detalhe de tendência já avaliada exibe score atual
  Given que o analista acessa o detalhe de uma tendência já avaliada
  When a página é carregada
  Then o score atual, o nível (badge), a origem (manual/IA) e as notas são exibidos
  And o formulário de avaliação é pré-preenchido com os valores registrados
```

---

### User Story 5 — Avaliar Tendência pelo Formulário Inline na Página de Detalhe (Priority: P1)

**As a** analista de pesquisa em IA  
**I want** preencher o formulário de avaliação diretamente na página de detalhe, sem precisar navegar para outra tela  
**So that** eu avalie a tendência com seu conteúdo completo visível ao mesmo tempo, sem perder contexto

O fluxo ideal é: ler o detalhe → avaliar na mesma tela → ver o score registrado — tudo sem mudança de contexto. O formulário inline elimina fricção do processo de avaliação.

**Why this priority**: A co-localização de conteúdo e formulário é essencial para a qualidade das avaliações. Navegar para outra tela interrompe o contexto e aumenta o esforço cognitivo.

**Independent Test**: Pode ser testado preenchendo o formulário inline na página de detalhe, salvando e verificando que o score registrado aparece imediatamente na mesma página e no dashboard.

**Acceptance Scenarios**:

```gherkin
Scenario: Formulário inline disponível na página de detalhe
  Given que o analista está na página de detalhe de qualquer tendência
  When a página é carregada
  Then o formulário com os 5 critérios de avaliação, campo de notas e score total em tempo real está visível na mesma página

Scenario: Score salvo no detalhe reflete imediatamente no dashboard
  Given que o analista avaliou uma tendência pelo formulário inline
  When retorna ao dashboard
  Then a tendência avaliada aparece no ranking na posição correta
  And não aparece mais na seção "Aguardando avaliação"

Scenario: Botão "Auto-score com IA" disponível no detalhe quando configurado
  Given que a integração com IA está configurada
  And o analista está na página de detalhe
  When visualiza o formulário de avaliação
  Then o botão "Auto-score com IA" está visível e funcional
```

---

### Edge Cases

- O que acontece quando o dashboard é acessado sem nenhuma tendência coletada? (estado vazio com orientação sobre como iniciar)
- O que acontece quando existem tendências coletadas mas nenhuma ainda avaliada? (ranking vazio, apenas seção "Aguardando avaliação" populada)
- O que acontece se o ID da tendência na URL de detalhe não existe? (página 404 com link de retorno ao dashboard)
- O que acontece se uma tendência não possui resumo ou URL? (campos ausentes devem ser sinalizados visualmente sem quebrar a página)
- O que acontece ao filtrar por tópico que não tem nenhuma tendência avaliada? (ranking vazio para o tópico, mas "Aguardando avaliação" pode ter itens)

---

## Requirements

### Functional Requirements

- **FR-001**: O dashboard DEVE exibir tendências avaliadas ordenadas por score total decrescente
- **FR-002**: Cada card no ranking DEVE exibir: título, tag de tópico com cor por categoria, nome da fonte, data de coleta, score total e badge de nível
- **FR-003**: O badge de nível DEVE seguir as faixas: Baixo (1,00–2,49), Médio (2,50–3,49), Alto (3,50–4,49), Crítico (4,50–5,00)
- **FR-004**: Tendências sem score DEVEM aparecer em seção separada "Aguardando avaliação", ordenadas por data de coleta decrescente
- **FR-005**: Tendências sem score NÃO DEVEM aparecer no ranking principal
- **FR-006**: O dashboard DEVE permitir filtrar por tópico; o filtro DEVE afetar tanto o ranking quanto a seção "Aguardando avaliação"
- **FR-007**: Ao avaliar uma tendência, ela DEVE migrar automaticamente de "Aguardando avaliação" para o ranking na posição correta
- **FR-008**: A página de detalhe DEVE exibir: título, resumo completo, URL da fonte (link clicável em nova aba), nome da fonte, tópico e data de coleta
- **FR-009**: A página de detalhe DEVE exibir o formulário de scoring inline com os 5 critérios, campo de notas e score total calculado em tempo real
- **FR-010**: Para tendência já avaliada, o formulário inline DEVE ser pré-preenchido com os valores do score atual
- **FR-011**: Para tendência já avaliada, a página de detalhe DEVE exibir score atual, badge de nível, origem (manual/IA) e notas
- **FR-012**: O botão "Auto-score com IA" DEVE aparecer no formulário inline do detalhe somente quando a integração estiver configurada
- **FR-013**: Após salvar score no detalhe, a página DEVE exibir o score registrado sem necessidade de recarregar manualmente
- **FR-014**: Acessar URL de detalhe com ID inexistente DEVE exibir página de não encontrado com link de retorno ao dashboard

### Non-Functional Requirements

- **NFR-001 (Performance)**: O dashboard DEVE carregar e exibir o ranking em menos de 2 segundos
- **NFR-002 (Performance)**: A página de detalhe DEVE carregar em menos de 2 segundos
- **NFR-003 (Consistência visual)**: Tags de tópico DEVEM usar cores consistentes em todo o sistema — o mesmo tópico sempre exibe a mesma cor
- **NFR-004 (Responsividade)**: O dashboard e a página de detalhe DEVEM ser utilizáveis em telas de desktop e tablet

### Key Entities

- **Dashboard**: visão agregada das tendências, dividida em duas seções — ranking (com score) e backlog (sem score)
- **TrendCard**: representação resumida de uma tendência no dashboard — exibe campos-chave e badge de nível
- **TrendDetail**: página completa de uma tendência com todos os campos e formulário de scoring inline
- **ScoreBadge**: componente visual que mapeia faixa de score para nível (Baixo/Médio/Alto/Crítico) com cor correspondente

---

## Architectural Considerations

### Caching

- **Needed?** EVALUATE LATER
- **Justification**: Dashboard é a página mais acessada. Se o volume de usuários simultâneos crescer, cache da lista ordenada pode ser relevante. Para o MVP com equipe interna pequena, não é necessário.

### Message Queues / Async Processing

- **Needed?** NO
- **Justification**: Exibição de dados e submissão de score são operações síncronas de baixa complexidade.

### Event Streaming

- **Needed?** NO
- **Justification**: Atualizações do dashboard não precisam ser em tempo real. Recarregar após ação do usuário é suficiente.

### Background Jobs / Scheduled Tasks

- **Needed?** NO
- **Justification**: Nenhuma operação agendada nesta feature.

---

## Test Scenarios

> **Test scenarios para esta feature estão documentados em [`test-scenarios.md`](./test-scenarios.md)**.
> Total de cenários: 21 | US01: 3 | US02: 3 | US03: 3 | US04: 3 | US05: 3 | Edge Cases: 4 | NFR: 2

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Tendências avaliadas aparecem no ranking na ordem correta de score — verificável com 3+ tendências de scores distintos
- **SC-002**: Badge de nível de cada tendência corresponde à faixa correta do seu score — 100% de conformidade
- **SC-003**: Tendências sem score aparecem exclusivamente na seção "Aguardando avaliação" e nunca no ranking principal
- **SC-004**: Após avaliar uma tendência, ela migra para o ranking sem necessidade de recarregar a página manualmente
- **SC-005**: Dashboard e página de detalhe carregam em menos de 2 segundos em condições normais
- **SC-006**: O mesmo tópico exibe sempre a mesma cor de tag em todo o sistema
