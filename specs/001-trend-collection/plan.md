# Implementation Plan: Trend Collection

**Branch**: `001-trend-collection` | **Date**: 2026-03-25 | **Spec**: [spec.md](./spec.md)

## Summary

Implementar a camada de coleta diária de tendências em IA a partir de 5 APIs REST dedicadas e 13 feeds RSS configuráveis, com deduplicação por URL, isolamento de falhas por fonte, job agendado via Vercel Cron e endpoint de health check. A arquitetura usa adapters isolados por fonte, um orchestrador central e persistência via Mongoose com upsert para deduplicação.

---

## Technical Context

| Item | Decisão |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Runtime** | Node.js 18+ (fetch nativo) |
| **Banco** | MongoDB Atlas via Mongoose |
| **Deploy** | Vercel (free → Pro para timeout > 10s) |
| **Cron** | Vercel Cron Jobs (`vercel.json`) |
| **RSS Parsing** | `rss-parser` |
| **XML Parsing** | `fast-xml-parser` (arXiv Atom) |
| **Validação** | Zod |
| **Type Checking** | TypeScript strict mode |
| **Testes** | Jest + ts-jest |

---

## Constitution Check

- [x] TypeScript strict mode (`"strict": true` em `tsconfig.json`)
- [x] `any` proibido — todos os adapters tipados via `CollectorResult`
- [x] Schemas Zod para request/response das API Routes
- [x] Models Mongoose com interface TypeScript explícita
- [x] Singleton de conexão MongoDB em `src/lib/mongodb/client.ts`
- [x] Try/catch em todas as API Routes com resposta de erro estruturada
- [x] Erros de coleta logados com contexto (fonte, erro)
- [x] `CRON_SECRET` valida endpoint de cron
- [x] Variáveis sensíveis nunca em `NEXT_PUBLIC_`
- [x] Health check em `/api/health` verificando MongoDB
- [x] Soft delete com campo `deletedAt` no model Trend
- [x] Índice `url: unique` para deduplicação via upsert
- [x] `CollectorResult` interface implementada por todos os adapters
- [x] Falha de collector isolada com try/catch por adapter

---

## Project Structure

```
specs/001-trend-collection/
├── plan.md           ← este arquivo
├── research.md       ← pesquisa de APIs, padrões, dependências
├── data-model.md     ← schemas Mongoose, interfaces TypeScript, config RSS
├── quickstart.md     ← guia de uso e extensão
└── contracts/
    ├── cron-collect.yaml
    └── health.yaml

src/
  app/
    api/
      cron/
        collect/
          route.ts          ← POST /api/cron/collect
      health/
        route.ts            ← GET /api/health
  lib/
    collectors/
      types.ts              ← CollectorResult, CollectorReport, Collector
      arxiv.ts              ← adapter arXiv (cs.LG + cs.AR)
      hackernews.ts         ← adapter HackerNews Algolia
      reddit.ts             ← adapter Reddit JSON
      semantic-scholar.ts   ← adapter Semantic Scholar
      papers-with-code.ts   ← adapter Papers With Code
      rss.ts                ← adapter RSS genérico
      rss-feeds.config.ts   ← lista de feeds configurável
      index.ts              ← orchestrator: executa todos, retorna relatório
    mongodb/
      client.ts             ← singleton de conexão Mongoose
      models/
        Trend.ts            ← schema + interface ITrend
        Topic.ts            ← schema + interface ITopic
      seed-topics.ts        ← seed inicial dos 3 tópicos

vercel.json                 ← cron schedule
```

---

## Architectural Decisions

### Caching
- **Decision**: NO
- **Justification**: Write-heavy, 1x/dia. Sem leituras de alta frequência nesta feature.

### Message Queues
- **Decision**: NO
- **Justification**: Volume < 500 itens/execução. Processamento síncrono com `Promise.allSettled()` é suficiente.

### Event Streaming
- **Decision**: NO
- **Justification**: Batch diário, sem consumidores em tempo real.

### Background Jobs
- **Decision**: YES — Vercel Cron Jobs
- **Schedule**: `0 7 * * *` (07:00 UTC)
- **Proteção**: `Authorization: Bearer CRON_SECRET`
- **Timeout**: Collectors executados em paralelo com `Promise.allSettled()` para manter execução total < 30s (limite Vercel Pro)

### RSS Parsing
- **Decision**: YES — `rss-parser` npm
- **Configuração**: `rss-feeds.config.ts` — array de `{ url, source, topicSlug }`. Novos feeds adicionados aqui sem código novo.

---

## Implementation Phases

### Phase 0: Research ✅
- [x] APIs documentadas (arXiv, HN, Reddit, Semantic Scholar, Papers With Code)
- [x] Padrão de parsing RSS com `rss-parser`
- [x] Padrão singleton MongoDB para serverless
- [x] Padrão upsert Mongoose para deduplicação
- [x] Vercel Cron proteção e limites de timeout
- Resultado: [`research.md`](./research.md)

### Phase 1: Design ✅
- [x] Data model: [`data-model.md`](./data-model.md)
- [x] API contracts: [`contracts/`](./contracts/)
- [x] Quickstart: [`quickstart.md`](./quickstart.md)

### Phase 2: Task Breakdown → `/specforge.tasks`

### Phase 3: Implementation

#### 3.1 — Fundação (prerequisite de tudo)
1. Scaffold Next.js 14: `npx create-next-app@latest iapulse --typescript --tailwind --app`
2. Instalar dependências: `npm install mongoose rss-parser fast-xml-parser zod`
3. Criar `src/lib/mongodb/client.ts` (singleton)
4. Criar `src/lib/mongodb/models/Trend.ts`
5. Criar `src/lib/mongodb/models/Topic.ts`
6. Criar `src/lib/mongodb/seed-topics.ts`
7. Configurar `.env.local` com `MONGODB_URI` e `CRON_SECRET`

#### 3.2 — Interface e tipos dos collectors
1. Criar `src/lib/collectors/types.ts` (`CollectorResult`, `CollectorReport`, `Collector`)
2. Criar `src/lib/collectors/rss-feeds.config.ts` com todos os 13 feeds

#### 3.3 — Adapters de API REST
1. `src/lib/collectors/arxiv.ts` — fetch + fast-xml-parser
2. `src/lib/collectors/hackernews.ts` — Algolia API
3. `src/lib/collectors/reddit.ts` — JSON endpoint com User-Agent
4. `src/lib/collectors/semantic-scholar.ts` — Graph API
5. `src/lib/collectors/papers-with-code.ts` — REST API

#### 3.4 — Adapter RSS Genérico
1. `src/lib/collectors/rss.ts` — aceita `RssFeedConfig[]`, retorna `CollectorResult[]`

#### 3.5 — Orchestrator
1. `src/lib/collectors/index.ts`:
   - Executa todos os collectors com `Promise.allSettled()`
   - Deduplicação: upsert no MongoDB por URL (`$setOnInsert`)
   - Retorna array de `CollectorReport`

#### 3.6 — API Routes
1. `src/app/api/cron/collect/route.ts`:
   - Valida `Authorization: Bearer CRON_SECRET`
   - Chama orchestrator
   - Retorna `CollectResponse` (contrato em `cron-collect.yaml`)
2. `src/app/api/health/route.ts`:
   - Tenta conectar ao MongoDB
   - Retorna `HealthResponse` com status e timestamp

#### 3.7 — Vercel Config
1. Criar `vercel.json` com cron schedule

#### 3.8 — Testes
1. Testes unitários por adapter (mock de fetch)
2. Teste de integração do orchestrator (mock dos adapters)
3. Teste da rota de coleta (sem credencial → 401, com credencial → 200)
4. Teste do health check (MongoDB conectado → 200, desconectado → 503)

---

## Dependências Entre Tasks

```
3.1 (fundação) → 3.2 (tipos) → 3.3, 3.4 (adapters) → 3.5 (orchestrator) → 3.6 (routes) → 3.7, 3.8
```

---

## Riscos e Mitigações

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Timeout no Vercel free (10s) | Alta | Executar collectors em paralelo; upgrade para Vercel Pro (60s) |
| Feed RSS com formato não-padrão | Média | try/catch por feed; descartar item com campo ausente e logar |
| Rate limit do Reddit sem User-Agent | Alta | Configurar `User-Agent` customizado em todas as requests |
| arXiv XML com estrutura variada | Baixa | Usar `fast-xml-parser` com opções tolerantes; validar campos antes de inserir |
| Papers With Code sem rate limit documentado | Média | Delay de 1s entre requests; fallback silencioso se 429 |

---

## Critérios de Conclusão da Feature

Todos os critérios do `spec.md`:
- [ ] SC-001: Itens de ≥ 10 fontes distintas após execução bem-sucedida
- [ ] SC-002: URL duplicada aparece apenas uma vez no banco
- [ ] SC-003: Fonte com URL inválida → demais fontes coletam normalmente
- [ ] SC-004: Endpoint sem credencial → 100% das requests retornam 401
- [ ] SC-005: `/api/health` responde em < 2s
- [ ] SC-006: Ciclo completo conclui em < 10 minutos
