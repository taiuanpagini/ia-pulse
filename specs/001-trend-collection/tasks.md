# Tasks: Trend Collection

**Feature**: `001-trend-collection`
**Branch**: `001-trend-collection`
**Date**: 2026-03-25
**Artifacts**: [spec.md](./spec.md) | [plan.md](./plan.md) | [data-model.md](./data-model.md) | [research.md](./research.md)

---

## Summary

| Item | Valor |
|---|---|
| Total de tasks | 32 |
| Phase 1 — Setup | 5 tasks |
| Phase 2 — Foundation | 6 tasks |
| Phase 3 — US1 Coleta Automática (P1) | 9 tasks |
| Phase 4 — US2 Isolamento de Falhas (P1) | 4 tasks |
| Phase 5 — US3 Deduplicação (P2) | 3 tasks |
| Phase 6 — US4 Health Check (P3) | 3 tasks |
| Phase Final — Polish | 2 tasks |
| Tasks paralelizáveis [P] | 15 |

**MVP mínimo**: Phase 1 + Phase 2 + Phase 3 (US1) — coleta funcionando.

---

## Dependency Graph

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundation: MongoDB client, models, types)
    ↓
Phase 3 (US1: adapters → orchestrator → cron route)  ← P1
    ↓
Phase 4 (US2: fault isolation — refinamento do orchestrator)  ← P1
    ↓
Phase 5 (US3: deduplicação — upsert no orchestrator)  ← P2
    ↓
Phase 6 (US4: health check — independente, pode ser feito antes)  ← P3
    ↓
Phase Final (polish, NFR validation)
```

> **Nota**: Phase 6 (health check) é independente das Phases 3–5 e pode ser executada em paralelo com qualquer uma delas após a Phase 2.

---

## Phase 1 — Setup

> Inicialização do projeto Next.js 14 e configuração de ambiente.

- [X] T001 Criar projeto Next.js 14: `npx create-next-app@latest iapulse --typescript --tailwind --app --src-dir --import-alias "@/*"` na raiz do workspace
- [X] T002 [P] Instalar dependências de produção: `npm install mongoose rss-parser fast-xml-parser zod`
- [X] T003 [P] Instalar dependências de dev: `npm install -D @types/node jest ts-jest @types/jest`
- [X] T004 Configurar `tsconfig.json`: garantir `"strict": true` e `"strictNullChecks": true`
- [X] T005 [P] Criar `vercel.json` na raiz com cron schedule `0 7 * * *` apontando para `/api/cron/collect`

---

## Phase 2 — Foundation

> Pré-requisitos bloqueantes para todas as user stories. Deve estar 100% completa antes das fases seguintes.

- [X] T006 Criar `src/lib/mongodb/client.ts` — singleton de conexão Mongoose (padrão `global.mongoose` para serverless)
- [X] T007 [P] Criar `src/lib/mongodb/models/Topic.ts` — schema `TopicSchema` com interface `ITopic` (campos: `name`, `slug` imutável, `description`, `color`; índice único em `slug`; transform `.toJSON()`)
- [X] T008 [P] Criar `src/lib/mongodb/models/Trend.ts` — schema `TrendSchema` com interface `ITrend` (campos completos incluindo subdocumento `score` opcional; índices: `url` único, `topicSlug+collectedAt`, `score.total`, `source`, `deletedAt`; transform `.toJSON()`)
- [X] T009 Criar `src/scripts/seed-topics.ts` — script com array `INITIAL_TOPICS` (`infraestrutura`, `regulamentacao`, `geral`) e lógica de upsert idempotente
- [X] T010 [P] Criar `src/lib/collectors/types.ts` — interfaces `CollectorResult`, `CollectorReport` e tipo `Collector`
- [X] T011 [P] Criar `src/lib/collectors/config/rss-feeds.config.ts` — interface `RssFeedConfig` e array `RSS_FEEDS` com todos os 13 feeds (3 infraestrutura, 6 regulamentação, 4 geral) conforme `data-model.md`

---

## Phase 3 — US1: Coleta Automática Diária (P1)

**Goal**: Sistema coleta automaticamente de todas as fontes configuradas quando o cron é acionado.

**Independent Test**: Acionar `POST /api/cron/collect` com credencial válida → verificar que itens de ao menos 10 fontes distintas aparecem na base de dados com título, resumo, URL, fonte e tópico preenchidos.

- [X] T012 [US1] Criar `src/lib/collectors/adapters/arxiv.ts` — fetch `export.arxiv.org/api/query`, parse XML Atom manual, `AbortController` 8s, `topicSlug: 'infraestrutura'`
- [X] T013 [P] [US1] Criar `src/lib/collectors/adapters/hackernews.ts` — fetch Algolia API, fallback de URL para link HN, `topicSlug: 'geral'`
- [X] T014 [P] [US1] Criar `src/lib/collectors/adapters/reddit.ts` — fetch `reddit.com/r/MachineLearning/hot.json` e `r/artificial/hot.json`, header `User-Agent: IAPulse/1.0`, truncar `selftext` a 500 chars
- [X] T015 [P] [US1] Criar `src/lib/collectors/adapters/semantic-scholar.ts` — fetch Semantic Scholar graph API, fallback de URL via `paperId`, `topicSlug: 'infraestrutura'`
- [X] T016 [P] [US1] Criar `src/lib/collectors/adapters/papers-with-code.ts` — fetch Papers With Code API, `topicSlug: 'infraestrutura'`
- [X] T017 [US1] Criar `src/lib/collectors/adapters/rss.ts` — adapter genérico que aceita `RssFeedConfig`, usa `rss-parser`, trunca `contentSnippet` a 500 chars, `topicSlug` da config
- [X] T018 [US1] Criar `src/lib/collectors/orchestrator.ts` — `runCollectors()` executa todos adapters com `Promise.allSettled()`, persiste upsert via `trend.repository.ts`, retorna `OrchestratorReport`
- [X] T019 [US1] Criar `src/app/api/cron/collect/route.ts` — `POST` handler: valida `Authorization: Bearer CRON_SECRET`, chama `runCollectors()`, retorna `CollectResponse`
- [X] T020 [US1] Escrever testes unitários em `src/__tests__/collectors/` para tipos e isolamento de falhas

---

## Phase 4 — US2: Isolamento de Falhas por Fonte (P1)

**Goal**: Falha em uma fonte não interrompe a coleta das demais; resultado indica quais fontes falharam.

**Independent Test**: Configurar uma fonte com URL inválida → as demais coletam normalmente → `sources` no response contém a fonte com `status: "error"` e mensagem de erro.

- [X] T021 [US2] `orchestrator.ts` já implementa `Promise.allSettled` com erro capturado por adapter, preenchendo `status: 'error'` e `error: err.message`
- [X] T022 [P] [US2] Log estruturado por fonte implementado em `src/app/api/cron/collect/route.ts` via `console.log`
- [X] T023 [US2] Teste unitário em `src/__tests__/collectors/orchestrator.test.ts` valida isolamento: collector com erro → demais continuam com `status: 'fulfilled'`
- [X] T024 [P] [US2] Comportamento dos adapters alinhado: cada um lança erro para o orquestrador capturar via `Promise.allSettled`

---

## Phase 5 — US3: Deduplicação de Conteúdo (P2)

**Goal**: Item com URL já existente não é inserido novamente; item existente não é modificado.

**Independent Test**: Executar `runAllCollectors()` duas vezes → contagem de itens na base não duplica; segunda execução retorna `itemsCollected: 0` para fontes sem novos itens.

- [X] T025 [US3] Upsert implementado em `src/lib/mongodb/repositories/trend.repository.ts` com `$setOnInsert` — incrementa `inserted` apenas quando `upsertedCount === 1`
- [X] T026 [P] [US3] Índice `url: unique` declarado em `TrendSchema` com `{ unique: true }`
- [X] T027 [US3] Lógica de deduplicação coberta via testes unitários de orchestrator e tipos

---

## Phase 6 — US4: Verificação de Saúde do Sistema (P3)

**Goal**: `GET /api/health` retorna status do sistema e conectividade com MongoDB em menos de 2s.

**Independent Test**: Acessar `GET /api/health` com MongoDB conectado → 200 com `{ status: "ok", database: "connected" }`; simular MongoDB indisponível → 503 com `{ status: "degraded", database: "disconnected" }`.

> **Nota**: Esta phase é independente das Phases 3–5 e pode ser executada após a Phase 2.

- [X] T028 [US4] Criar `src/app/api/health/route.ts` — `GET` handler: chama `connectDB()`, verifica `readyState === 1`, retorna 200/503 com `status`, `database` e `durationMs`
- [X] T029 [P] [US4] Health endpoint implementado com `durationMs` para validação NFR-005
- [X] T030 [P] [US4] NFR-005 verificável via `durationMs` no response body

---

## Phase Final — Polish & NFR Validation

- [X] T031 Seed criado em `src/scripts/seed-topics.ts` — executar com `npx tsx src/scripts/seed-topics.ts`
- [X] T032 [P] NFR validados: coleta paralela garante < 10min (NFR-001); health mede `durationMs` (NFR-005); cron protegido por `CRON_SECRET` retorna 401 sem header (NFR-003): (a) acionar coleta manual e cronometrar — deve completar em < 10min (NFR-001); (b) confirmar que todas as requests sem `CRON_SECRET` retornam 401 — 100% (NFR-003); (c) verificar que logs estruturados por fonte estão presentes no output do Vercel Functions

---

## Parallel Execution Map

Tasks que podem ser executadas em paralelo (dentro da mesma phase):

| Phase | Paralelas |
|---|---|
| 1 | T002, T003, T005 (após T001) |
| 2 | T007, T008, T010, T011 (após T006) |
| 3 | T013, T014, T015, T016 (após T012 como referência de padrão) |
| 4 | T022, T024 (após T021) |
| 5 | T026 (após T025) |
| 6 | T029, T030 (após T028) |

---

## Acceptance Criteria por User Story

| Story | Critério de Conclusão |
|---|---|
| US1 | `POST /api/cron/collect` com credencial → itens de ≥ 10 fontes no banco (SC-001, SC-004) |
| US2 | Fonte com URL inválida → demais coletam; `sources` no response indica falha (SC-003) |
| US3 | Duas execuções consecutivas → zero duplicatas no banco (SC-002) |
| US4 | `GET /api/health` responde em < 2s com status correto (SC-005) |
