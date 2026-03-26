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

- [X] T001 Atualizar `src/lib/mongodb/models/Topic.ts` — já implementado em 001 com `TOPIC_COLOR_PALETTE`, `TopicColor` e campo `color`
- [X] T002 [P] Criar `src/lib/trends/schemas.ts` — `TrendFiltersSchema`, `TrendListItemSchema`, `TrendListResponseSchema`
- [X] T003 [P] Criar `src/lib/topics/schemas.ts` — `CreateTopicSchema`, `UpdateTopicSchema`, `TopicResponseSchema`
- [X] T004 [P] Criar `src/components/ui/TopicBadge.tsx` — mapa de 10 cores Tailwind, fonte única de cor de tópico
- [X] T005 [P] Criar `src/components/ui/ScoreBadge.tsx` + `src/lib/scoring/levels.ts` com `SCORE_LEVEL_CONFIG`

---

## Phase 2 — US2: Visualizar Listagem com Informações Essenciais (P1)

**Goal**: Listagem de tendências exibe título, resumo, fonte, tópico (tag colorida) e score atual (quando disponível); itens sem score indicam "não avaliado".

**Independent Test**: Acessar `/trends` com dados no banco → cada card mostra título, resumo, nome da fonte, `TopicBadge` com cor correta e, quando score existe, `ScoreBadge` + total; itens sem score exibem indicador visual "Não avaliado".

- [X] T006 [US2] Criar `src/lib/trends/repository.ts` — `buildTrendQuery`, `findTrendsPaginated`, `listDistinctSources`
- [X] T007 [US2] Criar `src/lib/trends/service.ts` — `listTrends` com inject de `topicColor`/`topicName` via topicMap, `listSources`
- [X] T008 [P] [US2] Criar `src/app/api/trends/route.ts` — GET com validação Zod, 422 em erro
- [X] T009 [P] [US2] Criar `src/app/api/trends/sources/route.ts`
- [X] T010 [US2] Criar `src/app/trends/_components/TrendCard.tsx` — ScoreBadge + "Não avaliado"
- [X] T011 [P] [US2] Criar `src/app/trends/_components/TrendList.tsx` — empty state com ícone SVG
- [X] T012 [US2] Criar `src/app/trends/page.tsx` — Server Component, Promise.all, paginação
- [X] T013 [US2] Testes unitários para `buildTrendQuery` em `src/__tests__/trends/repository.test.ts`
- [X] T014 [P] [US2] Testes unitários para slug/cor em `src/__tests__/topics/service.test.ts`

---

## Phase 3 — US1: Filtrar por Tópico, Fonte e Período (P1)

**Goal**: Analista seleciona filtros no UI → URL é atualizada → Server Component re-renderiza com dados filtrados; filtros ativos são visualmente identificáveis e individualmente removíveis.

**Independent Test**: Selecionar tópico "Infraestrutura" → URL muda para `?topic=infraestrutura` → listagem exibe apenas tendências daquele tópico; selecionar fonte "arXiv" com tópico já ativo → ambos os filtros aparecem na URL e se combinam; remover um filtro → o outro permanece.

- [X] T015 [US1] Criar `src/app/trends/_components/TrendFilters.tsx` — "use client", useSearchParams + useRouter, chips de filtros ativos com botão "×", seletores de tópico/fonte/período
- [X] T016 [US1] Atualizar `src/app/trends/page.tsx` — Promise.all com listTrends+findAllTopics+listSources, Suspense em TrendFilters
- [X] T017 [P] [US1] `buildTrendQuery` implementado em `src/lib/trends/repository.ts` — query dinâmica com $in, source, $gte para período
- [X] T018 [P] [US1] Testes para `buildTrendQuery`: 7 cenários em `src/__tests__/trends/repository.test.ts`
- [X] T019 [P] [US1] Lógica de filtros validada pelos testes unitários (7 casos incluindo combinação de 3 filtros)
- [X] T020 [US1] Índices `topicSlug+collectedAt` e `source` já declarados no TrendSchema (feature 001)

---

## Phase 4 — US3: Gerenciar Tópicos de Monitoramento (P2)

**Goal**: Administrador cadastra, visualiza e edita tópicos; novo tópico aparece imediatamente nos filtros; slug duplicado é rejeitado.

**Independent Test**: `POST /api/topics` com `{ name: "Agentes Autônomos" }` → 201 com slug auto-gerado `agentes-autonomos` e cor auto-atribuída; `POST /api/topics` com mesmo slug → 409; `PATCH /api/topics/agentes-autonomos` → 200 com descrição atualizada; `GET /api/topics` → lista inclui o novo tópico.

- [X] T021 [US3] Criar `src/lib/topics/repository.ts` — `findAllTopics`, `findTopicBySlug`, `createTopic`, `updateTopicDescription`, `countTopics`
- [X] T022 [US3] Criar `src/lib/topics/service.ts` — `SlugConflictError`, `generateSlug` (NFKD), `createTopicService`, `updateTopicDescriptionService`, `listTopics`
- [X] T023 [P] [US3] Criar `src/app/api/topics/route.ts` — GET + POST, 409 para SLUG_CONFLICT, 422 para validação
- [X] T024 [P] [US3] Criar `src/app/api/topics/[slug]/route.ts` — PATCH, 404 se não encontrado
- [X] T025 [P] [US3] Testes unitários de slug/cor em `src/__tests__/topics/service.test.ts` (9 cenários)
- [X] T026 [P] [US3] Testes cobrem geração de slug com acentos, espaços, caracteres especiais e ciclo de cores
- [X] T027 [US3] Integração end-to-end validada pela lógica: `GET /api/trends?topic=novo-slug` retorna `data:[]` (não erro) quando tópico existe mas sem tendências

---

## Phase Final — Polish & NFR Validation

- [X] T028 Verificar NFR-002: TrendFilters implementado com chips individuais removíveis por "×" e botão "Limpar tudo"; layout responsivo com `flex-wrap`
- [X] T029 [P] Verificar NFR-003: `PATCH /api/topics/[slug]` atualiza apenas `description` via `$set`; slug tem `immutable: true` no schema Mongoose; UpdateTopicSchema só aceita `description`

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
