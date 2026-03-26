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

- [ ] T001 Criar projeto Next.js 14: `npx create-next-app@latest iapulse --typescript --tailwind --app --src-dir --import-alias "@/*"` na raiz do workspace
- [ ] T002 [P] Instalar dependências de produção: `npm install mongoose rss-parser fast-xml-parser zod`
- [ ] T003 [P] Instalar dependências de dev: `npm install -D @types/node jest ts-jest @types/jest`
- [ ] T004 Configurar `tsconfig.json`: garantir `"strict": true` e `"strictNullChecks": true`
- [ ] T005 [P] Criar `vercel.json` na raiz com cron schedule `0 7 * * *` apontando para `/api/cron/collect`

---

## Phase 2 — Foundation

> Pré-requisitos bloqueantes para todas as user stories. Deve estar 100% completa antes das fases seguintes.

- [ ] T006 Criar `src/lib/mongodb/client.ts` — singleton de conexão Mongoose (padrão `global.mongoose` para serverless)
- [ ] T007 [P] Criar `src/lib/mongodb/models/Topic.ts` — schema `TopicSchema` com interface `ITopic` (campos: `name`, `slug` imutável, `description`, `color`; índice único em `slug`; transform `.toJSON()`)
- [ ] T008 [P] Criar `src/lib/mongodb/models/Trend.ts` — schema `TrendSchema` com interface `ITrend` (campos completos incluindo subdocumento `score` opcional; índices: `url` único, `topicSlug+collectedAt`, `score.total`, `source`, `deletedAt`; transform `.toJSON()`)
- [ ] T009 Criar `src/lib/mongodb/seed-topics.ts` — script com array `INITIAL_TOPICS` (`infraestrutura`, `regulamentacao`, `geral`) e lógica de upsert idempotente
- [ ] T010 [P] Criar `src/lib/collectors/types.ts` — interfaces `CollectorResult`, `CollectorReport` e tipo `Collector`
- [ ] T011 [P] Criar `src/lib/collectors/rss-feeds.config.ts` — interface `RssFeedConfig` e array `RSS_FEEDS` com todos os 13 feeds (3 infraestrutura, 6 regulamentação, 4 geral) conforme `data-model.md`

---

## Phase 3 — US1: Coleta Automática Diária (P1)

**Goal**: Sistema coleta automaticamente de todas as fontes configuradas quando o cron é acionado.

**Independent Test**: Acionar `POST /api/cron/collect` com credencial válida → verificar que itens de ao menos 10 fontes distintas aparecem na base de dados com título, resumo, URL, fonte e tópico preenchidos.

- [ ] T012 [US1] Criar `src/lib/collectors/arxiv.ts` — fetch `export.arxiv.org/api/query?search_query=cat:cs.LG+OR+cat:cs.AR&max_results=50`, parse XML Atom com `fast-xml-parser`, mapear campos para `CollectorResult[]`, `AbortController` com timeout de 8s, `topicSlug: 'infraestrutura'`
- [ ] T013 [P] [US1] Criar `src/lib/collectors/hackernews.ts` — fetch Algolia API `hn.algolia.com/api/v1/search?query=machine+learning&tags=story`, filtrar por `created_at_i` das últimas 24h, fallback de URL para link HN quando `hit.url` ausente, `topicSlug: 'geral'`
- [ ] T014 [P] [US1] Criar `src/lib/collectors/reddit.ts` — fetch `reddit.com/r/MachineLearning/top.json?t=day&limit=25` e `r/artificial/top.json`, header `User-Agent: IAPulse/1.0`, truncar `selftext` a 500 chars, `topicSlug: 'geral'`
- [ ] T015 [P] [US1] Criar `src/lib/collectors/semantic-scholar.ts` — fetch `api.semanticscholar.org/graph/v1/paper/search?query=artificial+intelligence&fields=title,abstract,url&limit=50`, fallback de URL via `paperId`, `topicSlug: 'infraestrutura'`
- [ ] T016 [P] [US1] Criar `src/lib/collectors/papers-with-code.ts` — fetch `paperswithcode.com/api/v1/papers/?ordering=-published&page_size=50`, delay de 1s entre requests se paginado, `AbortController` 8s, `topicSlug: 'infraestrutura'`
- [ ] T017 [US1] Criar `src/lib/collectors/rss.ts` — adapter genérico que aceita `RssFeedConfig[]`, usa `rss-parser` para fetch de cada feed, mapeia `item.title`, `item.contentSnippet` (truncado a 500 chars), `item.link` para `CollectorResult`, `topicSlug` da config
- [ ] T018 [US1] Criar `src/lib/collectors/index.ts` — orquestrador: `runAllCollectors()` executa todos os adapters (API + RSS) com `Promise.allSettled()`, persiste com upsert via Mongoose, retorna `CollectorReport[]` com status por fonte
- [ ] T019 [US1] Criar `src/app/api/cron/collect/route.ts` — `POST` handler: valida `Authorization: Bearer CRON_SECRET`, chama `runAllCollectors()`, retorna `CollectResponse` com `ok`, `collectedAt`, `totalNewItems`, `sources[]` (contrato em `contracts/cron-collect.yaml`)
- [ ] T020 [US1] Escrever testes de integração para `POST /api/cron/collect` em `src/app/api/cron/collect/__tests__/route.test.ts`: requisição sem header → 401; requisição com `CRON_SECRET` válido → 200 com array `sources`

---

## Phase 4 — US2: Isolamento de Falhas por Fonte (P1)

**Goal**: Falha em uma fonte não interrompe a coleta das demais; resultado indica quais fontes falharam.

**Independent Test**: Configurar uma fonte com URL inválida → as demais coletam normalmente → `sources` no response contém a fonte com `status: "error"` e mensagem de erro.

- [ ] T021 [US2] Atualizar `src/lib/collectors/index.ts` — garantir `try/catch` por adapter dentro do `Promise.allSettled`: erro capturado preenche `CollectorReport` com `status: 'error'` e `error: err.message`; collector bem-sucedido preenche com `status: 'success'` e `itemsCollected`
- [ ] T022 [P] [US2] Adicionar log estruturado por fonte ao final de cada execução em `src/app/api/cron/collect/route.ts` — `console.log(JSON.stringify({ source, status, itemsCollected, error }))` por item do array `sources`
- [ ] T023 [US2] Validar que `CollectResponse.sources` é sempre retornado completo (mesmo com erros) — escrever teste unitário em `src/lib/collectors/__tests__/index.test.ts`: mock de um collector lançando erro → `runAllCollectors()` retorna report com `status: 'error'` e os demais com `status: 'success'`
- [ ] T024 [P] [US2] Escrever teste unitário para cada adapter: mock de `fetch` retornando erro de rede → adapter retorna array vazio (não lança) OU lança para que o orquestrador capture — alinhar comportamento com o padrão definido em T021

---

## Phase 5 — US3: Deduplicação de Conteúdo (P2)

**Goal**: Item com URL já existente não é inserido novamente; item existente não é modificado.

**Independent Test**: Executar `runAllCollectors()` duas vezes → contagem de itens na base não duplica; segunda execução retorna `itemsCollected: 0` para fontes sem novos itens.

- [ ] T025 [US3] Implementar upsert em `src/lib/collectors/index.ts` — para cada `CollectorResult`, usar `Trend.updateOne({ url: item.url }, { $setOnInsert: { ...item, collectedAt: new Date() } }, { upsert: true })`; incrementar contador de novos itens apenas quando `result.upsertedCount === 1`
- [ ] T026 [P] [US3] Verificar e documentar índice `url: unique` no `TrendSchema` (T008) — confirmar que `{ unique: true }` está declarado; escrever teste unitário que tenta inserir dois documentos com mesma URL e verifica que o segundo é rejeitado silenciosamente pelo upsert
- [ ] T027 [US3] Escrever teste de integração em `src/lib/collectors/__tests__/dedup.test.ts`: inserir item via upsert → inserir mesmo item novamente → verificar que `Trend.countDocuments({ url })` === 1 e que `collectedAt` do documento não foi alterado

---

## Phase 6 — US4: Verificação de Saúde do Sistema (P3)

**Goal**: `GET /api/health` retorna status do sistema e conectividade com MongoDB em menos de 2s.

**Independent Test**: Acessar `GET /api/health` com MongoDB conectado → 200 com `{ status: "ok", database: "connected" }`; simular MongoDB indisponível → 503 com `{ status: "degraded", database: "disconnected" }`.

> **Nota**: Esta phase é independente das Phases 3–5 e pode ser executada após a Phase 2.

- [ ] T028 [US4] Criar `src/app/api/health/route.ts` — `GET` handler: chama `connectDB()`, executa `mongoose.connection.readyState === 1` para verificar conectividade, retorna `HealthResponse` com `status`, `database` e `timestamp` (contrato em `contracts/health.yaml`); HTTP 200 se conectado, 503 se não
- [ ] T029 [P] [US4] Escrever testes de integração para `GET /api/health` em `src/app/api/health/__tests__/route.test.ts`: MongoDB acessível → 200 + `status: "ok"`; mock de `connectDB` lançando erro → 503 + `status: "degraded"`
- [ ] T030 [P] [US4] Verificar NFR-005: tempo de resposta do health endpoint < 2s — adicionar assertion de timeout no teste de integração

---

## Phase Final — Polish & NFR Validation

- [ ] T031 Executar seed de tópicos iniciais: `npx tsx src/lib/mongodb/seed-topics.ts` e documentar o comando no `README.md` (criar arquivo se não existir)
- [ ] T032 [P] Validar NFRs de ponta a ponta: (a) acionar coleta manual e cronometrar — deve completar em < 10min (NFR-001); (b) confirmar que todas as requests sem `CRON_SECRET` retornam 401 — 100% (NFR-003); (c) verificar que logs estruturados por fonte estão presentes no output do Vercel Functions

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
