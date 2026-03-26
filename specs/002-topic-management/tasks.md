# Tasks: Topic Management

**Feature**: `002-topic-management`
**Branch**: `001-trend-collection`
**Date**: 2026-03-25
**Artifacts**: [spec.md](./spec.md) | [plan.md](./plan.md) | [data-model.md](./data-model.md) | [research.md](./research.md)
**Depends on**: `001-trend-collection` completamente implementada

---

## Summary

| Item | Valor |
|---|---|
| Total de tasks | 29 |
| Phase 1 — Foundation | 5 tasks |
| Phase 2 — US2: Listagem Essencial (P1) | 9 tasks |
| Phase 3 — US1: Filtros (P1) | 6 tasks |
| Phase 4 — US3: Gestão de Tópicos (P2) | 7 tasks |
| Phase Final — Polish | 2 tasks |
| Tasks paralelizáveis [P] | 14 |

**MVP mínimo**: Phase 1 + Phase 2 — listagem básica sem filtros.

---

## Dependency Graph

```
Feature 001 (Trend + Topic models, MongoDB client)
    ↓
Phase 1 (Foundation: atualizar Topic com color, Zod schemas de trends)
    ↓
Phase 2 (US2: lib trends → API trends → TrendCard + TrendList + page.tsx)
    ↓
Phase 3 (US1: TrendFilters Client Component → integração com searchParams)
    ↓
Phase 4 (US3: lib topics → API topics → pode ser feito em paralelo com Phase 3)
    ↓
Phase Final (polish, NFR validation)
```

> **Nota**: Phase 4 (US3 — gestão de tópicos) é parcialmente independente das Phases 2 e 3. O backend de tópicos (lib + API) pode ser implementado em paralelo com a Phase 3. Apenas o componente `TopicFilterBar` precisa de tópicos disponíveis na API.

---

## Phase 1 — Foundation

> Atualização do model Topic com campo `color` e definição dos Zod schemas. Pré-requisito bloqueante para todas as fases seguintes.

- [ ] T001 Atualizar `src/lib/mongodb/models/Topic.ts` — adicionar constante `TOPIC_COLOR_PALETTE`, tipo `TopicColor`, e campo `color: { type: String, enum: TOPIC_COLOR_PALETTE, default: 'blue' }` ao schema (retrocompatível com documentos existentes)
- [ ] T002 [P] Criar `src/lib/trends/schemas.ts` — schemas Zod: `TrendFiltersSchema` (topic, source, period enum, page, limit), `TrendListItemSchema` (com topicColor), `TrendListResponseSchema` com `PaginationSchema`
- [ ] T003 [P] Criar `src/lib/topics/schemas.ts` — schemas Zod: `CreateTopicSchema`, `UpdateTopicSchema`, `TopicResponseSchema` com `color` enum
- [ ] T004 [P] Criar `src/components/ui/TopicBadge.tsx` — Server Component; recebe `name: string` e `color: string`; mapa `colorClasses` com todas as 10 cores da paleta para classes Tailwind (`bg-${color}-100 text-${color}-800` + dark mode); é o único componente que renderiza cor de tópico no sistema inteiro
- [ ] T005 [P] Criar `src/components/ui/ScoreBadge.tsx` — Server Component; recebe `total: number`; usa `getScoreLevel()` de `src/lib/scoring/levels.ts` (criar arquivo se ainda não existir com `SCORE_LEVEL_CONFIG`); exibe badge com label e cor por faixa

---

## Phase 2 — US2: Visualizar Listagem com Informações Essenciais (P1)

**Goal**: Listagem de tendências exibe título, resumo, fonte, tópico (tag colorida) e score atual (quando disponível); itens sem score indicam "não avaliado".

**Independent Test**: Acessar `/trends` com dados no banco → cada card mostra título, resumo, nome da fonte, `TopicBadge` com cor correta e, quando score existe, `ScoreBadge` + total; itens sem score exibem indicador visual "Não avaliado".

- [ ] T006 [US2] Criar `src/lib/trends/repository.ts` — funções: `findTrendsPaginated(filter, page, limit)` com `Trend.find(query).skip().limit().sort({ collectedAt: -1 }).lean()` e `countTrends(filter)` em `Promise.all`; `listDistinctSources()` com `Trend.distinct('source', { deletedAt: null })`
- [ ] T007 [US2] Criar `src/lib/trends/service.ts` — função `listTrends(filters: TrendFilters)`: chama `buildTrendQuery(filters)`, executa `findTrendsPaginated`, busca tópicos via `findAllTopics()`, injeta `topicColor` e `topicName` em cada item via map; retorna `TrendListResponse`; função `listSources()`: chama `listDistinctSources()`
- [ ] T008 [P] [US2] Criar `src/app/api/trends/route.ts` — `GET` handler: valida `searchParams` com `TrendFiltersSchema.safeParse()`, retorna 422 se inválido, chama `listTrends(filters)`, retorna `TrendListResponse`; try/catch com resposta de erro estruturada
- [ ] T009 [P] [US2] Criar `src/app/api/trends/sources/route.ts` — `GET` handler: chama `listSources()`, retorna `{ data: string[] }`
- [ ] T010 [US2] Criar `src/app/trends/_components/TrendCard.tsx` — Server Component; recebe `TrendListItem`; layout: título (link para `/trends/[id]`), resumo truncado a 3 linhas, `TopicBadge`, nome da fonte, data formatada; se `score` não null: exibe `ScoreBadge` + total formatado "X.XX"; se `score` null: badge cinza "Não avaliado"
- [ ] T011 [P] [US2] Criar `src/app/trends/_components/TrendList.tsx` — Server Component; recebe `TrendListItem[]`; renderiza lista de `TrendCard`; exibe empty state "Nenhuma tendência encontrada" com ícone quando array vazio
- [ ] T012 [US2] Criar `src/app/trends/page.tsx` — Server Component; recebe `searchParams`; valida com `TrendFiltersSchema`; chama `listTrends(filters)` (direto via Mongoose, sem fetch HTTP); renderiza `TrendList` + controles de paginação simples (botões Anterior/Próximo)
- [ ] T013 [US2] Escrever testes de integração para `GET /api/trends` em `src/app/api/trends/__tests__/route.test.ts`: sem filtros → 200 com `data` e `pagination`; `?period=invalido` → 422; resposta inclui `topicColor` em cada item
- [ ] T014 [P] [US2] Escrever teste unitário para `src/lib/trends/service.ts`: mock de `findTrendsPaginated` e `findAllTopics` → verificar que `topicColor` é injetado corretamente no item; verificar que item sem tópico cadastrado usa `color: 'blue'` como fallback

---

## Phase 3 — US1: Filtrar por Tópico, Fonte e Período (P1)

**Goal**: Analista seleciona filtros no UI → URL é atualizada → Server Component re-renderiza com dados filtrados; filtros ativos são visualmente identificáveis e individualmente removíveis.

**Independent Test**: Selecionar tópico "Infraestrutura" → URL muda para `?topic=infraestrutura` → listagem exibe apenas tendências daquele tópico; selecionar fonte "arXiv" com tópico já ativo → ambos os filtros aparecem na URL e se combinam; remover um filtro → o outro permanece.

- [ ] T015 [US1] Criar `src/app/trends/_components/TrendFilters.tsx` — Client Component (`"use client"`); recebe lista de tópicos e fontes disponíveis; usa `useSearchParams()` e `useRouter()` para ler filtros ativos da URL e emitir `router.push()` ao selecionar/remover; exibe chips de filtros ativos com botão "×" para remoção individual; seletor de tópico, fonte e período predefinido (`1d`, `7d`, `30d`, `90d`)
- [ ] T016 [US1] Atualizar `src/app/trends/page.tsx` — adicionar busca paralela de tópicos e fontes (`Promise.all([listTrends(filters), listTopics(), listSources()])`); passar dados para `TrendFilters` como props; envolver em `<Suspense>` para não bloquear renderização enquanto `TrendFilters` carrega
- [ ] T017 [P] [US1] Implementar `buildTrendQuery(filters: TrendFilters): FilterQuery<ITrend>` em `src/lib/trends/repository.ts` — monta objeto de query dinamicamente: `deletedAt: null` sempre; `topicSlug` com `$in` se múltiplos; `source` se presente; `collectedAt: { $gte: cutoff }` para períodos `1d/7d/30d/90d`; campos ausentes não são adicionados
- [ ] T018 [P] [US1] Escrever testes unitários para `buildTrendQuery` em `src/lib/trends/__tests__/repository.test.ts`: sem filtros → apenas `{ deletedAt: null }`; com `topic` → `{ topicSlug: 'x' }`; com `period: '7d'` → `collectedAt: { $gte: <7 dias atrás> }`; combinação de 3 filtros → query com todos os campos
- [ ] T019 [P] [US1] Escrever teste de integração para filtros combinados: `GET /api/trends?topic=infraestrutura&source=arXiv&period=30d` → resposta contém apenas tendências satisfazendo todos os critérios; `GET /api/trends?topic=nao-existe` → `{ data: [], pagination: { total: 0 } }` com 200 (não 404)
- [ ] T020 [US1] Validar NFR-001 e NFR-002: adicionar `console.time` em `listTrends` durante desenvolvimento e verificar que queries com filtros completam em < 2s; confirmar que índices `topicSlug+collectedAt` e `source` do `TrendSchema` estão sendo usados (`.explain()` no Mongo)

---

## Phase 4 — US3: Gerenciar Tópicos de Monitoramento (P2)

**Goal**: Administrador cadastra, visualiza e edita tópicos; novo tópico aparece imediatamente nos filtros; slug duplicado é rejeitado.

**Independent Test**: `POST /api/topics` com `{ name: "Agentes Autônomos" }` → 201 com slug auto-gerado `agentes-autonomos` e cor auto-atribuída; `POST /api/topics` com mesmo slug → 409; `PATCH /api/topics/agentes-autonomos` → 200 com descrição atualizada; `GET /api/topics` → lista inclui o novo tópico.

- [ ] T021 [US3] Criar `src/lib/topics/repository.ts` — funções: `findAllTopics()` ordenado por `name asc`; `findTopicBySlug(slug)` retorna `ITopic | null`; `createTopic(data)` com `Topic.create()`; `updateTopicDescription(slug, description)` com `Topic.findOneAndUpdate({ slug }, { description }, { new: true })`
- [ ] T022 [US3] Criar `src/lib/topics/service.ts` — `createTopic(input: CreateTopicInput)`: gera slug a partir do `name` se não fornecido (lowercase + normalização NFKD + replace de não-alfanuméricos por `-`); verifica unicidade via `findTopicBySlug`; auto-atribui `color` via `topicCount % palette.length`; chama `repository.createTopic()`; lança erro com código `SLUG_CONFLICT` se slug já existe
- [ ] T023 [P] [US3] Criar `src/app/api/topics/route.ts` — `GET`: chama `findAllTopics()`, retorna `{ data: TopicResponse[] }`; `POST`: valida com `CreateTopicSchema.safeParse()`, retorna 422 se inválido, chama `createTopic(input)`, retorna 201 com novo tópico, retorna 409 se `SLUG_CONFLICT`; try/catch com erro estruturado
- [ ] T024 [P] [US3] Criar `src/app/api/topics/[slug]/route.ts` — `PATCH`: valida `params.slug` e body com `UpdateTopicSchema.safeParse()`, retorna 422 se inválido, chama `updateTopicDescription(slug, description)`, retorna 404 se `null`, retorna 200 com tópico atualizado
- [ ] T025 [P] [US3] Escrever testes de integração para Topics API em `src/app/api/topics/__tests__/route.test.ts`: `GET /api/topics` → 200 com array; `POST /api/topics` com nome válido → 201 com slug gerado e cor; `POST /api/topics` com slug duplicado → 409; `PATCH /api/topics/[slug]` → 200; `PATCH /api/topics/inexistente` → 404
- [ ] T026 [P] [US3] Escrever testes unitários para `service.ts` em `src/lib/topics/__tests__/service.test.ts`: geração de slug a partir de nome com acentos ("Ação" → "acao"); slug com espaços ("IA Generativa" → "ia-generativa"); auto-assign de cor (0→blue, 1→emerald, 10→blue novamente)
- [ ] T027 [US3] Verificar integração end-to-end: criar tópico via `POST /api/topics` → chamar `GET /api/trends?topic=<novo-slug>` → retorna lista válida (vazia, não erro); confirmar que o novo tópico aparece no response de `GET /api/topics` que alimenta `TrendFilters`

---

## Phase Final — Polish & NFR Validation

- [ ] T028 Verificar NFR-002 (usabilidade): testar `TrendFilters` com ao menos 3 filtros simultâneos → chips de filtros ativos devem ser individualmente removíveis com botão "×" sem perder os demais filtros; confirmar responsividade em viewport de tablet (min-width: 768px)
- [ ] T029 [P] Verificar NFR-003 (slug imutável): tentar atualizar `slug` via `PATCH /api/topics/[slug]` — garantir que o schema Mongoose com `immutable: true` ignora a tentativa; confirmar que tendências já associadas ao slug continuam associadas após atualizar a descrição do tópico

---

## Parallel Execution Map

| Phase | Paralelas |
|---|---|
| 1 | T002, T003, T004, T005 (após T001) |
| 2 | T008, T009 (após T006+T007); T011, T014 (após T010) |
| 3 | T017, T018, T019 (após T015+T016) |
| 4 | T023, T024, T025, T026 (após T021+T022) |
| 4 vs 3 | Backend de topics (T021–T024) pode rodar em paralelo com T015–T020 |

---

## Acceptance Criteria por User Story

| Story | Critério de Conclusão |
|---|---|
| US2 | Listagem exibe 100% dos itens com `TopicBadge` colorido + score ou "Não avaliado" (SC-003) |
| US1 | Combinação de 3 filtros retorna conjunto correto; filtros ativos removíveis individualmente (SC-001, SC-002) |
| US3 | Cadastro com slug duplicado → 409; novo tópico aparece nos filtros imediatamente (SC-004, SC-006) |
