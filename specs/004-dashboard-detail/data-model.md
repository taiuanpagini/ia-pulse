# Data Model: Dashboard & Trend Detail

**Feature**: `004-dashboard-detail`
**Branch**: `001-trend-collection`
**Date**: 2026-03-25
**Depends on**: todas as features anteriores (Trend, Topic, score, formula, levels)

---

## Nenhuma Alteração de Schema

Esta feature é predominantemente de apresentação. Todos os modelos de dados necessários foram definidos nas features 001–003. Esta seção documenta as **projeções** (shapes de dados) que cada view necessita.

---

## Shapes de Dados por View

### Dashboard — Trend Card (Scored)

```typescript
// Projeção de Trend para card do ranking
interface ScoredTrendCard {
  id: string
  title: string
  source: string
  topicSlug: string
  topicName: string       // join com Topic
  topicColor: string      // join com Topic.color
  collectedAt: string     // ISO
  score: {
    total: number
    level: ScoreLevel     // calculado: 'baixo' | 'medio' | 'alto' | 'critico'
    scoredBy: 'manual' | 'llm'
  }
}
```

### Dashboard — Trend Card (Unscored)

```typescript
// Projeção de Trend para seção "Aguardando avaliação"
interface UnscoredTrendCard {
  id: string
  title: string
  source: string
  topicSlug: string
  topicName: string
  topicColor: string
  collectedAt: string
}
```

### Página de Detalhe

```typescript
// Projeção completa de Trend + Topic join
interface TrendDetail {
  id: string
  title: string
  summary: string
  url: string
  source: string
  topicSlug: string
  topicName: string
  topicColor: string
  collectedAt: string
  score?: {
    maturity: number
    applicability: number
    competitiveImpact: number
    strategicAlignment: number
    adoptionComplexity: number
    total: number
    level: ScoreLevel
    scoredBy: 'manual' | 'llm'
    scoredAt: string
    notes?: string
  }
}
```

---

## Zod Schemas de Response

```typescript
// src/lib/trends/schemas.ts (adições para esta feature)

import { z } from 'zod'

const ScoreLevelSchema = z.enum(['baixo', 'medio', 'alto', 'critico'])

// Usado na API GET /api/trends/[id]
export const TrendDetailResponseSchema = z.object({
  data: z.object({
    id:          z.string(),
    title:       z.string(),
    summary:     z.string(),
    url:         z.string(),
    source:      z.string(),
    topicSlug:   z.string(),
    topicName:   z.string(),
    topicColor:  z.string(),
    collectedAt: z.string(),
    score: z.object({
      maturity:           z.number().int().min(1).max(5),
      applicability:      z.number().int().min(1).max(5),
      competitiveImpact:  z.number().int().min(1).max(5),
      strategicAlignment: z.number().int().min(1).max(5),
      adoptionComplexity: z.number().int().min(1).max(5),
      total:    z.number().min(1).max(5),
      level:    ScoreLevelSchema,
      scoredBy: z.enum(['manual', 'llm']),
      scoredAt: z.string(),
      notes:    z.string().optional(),
    }).nullable(),
  }),
})

export type TrendDetailResponse = z.infer<typeof TrendDetailResponseSchema>
```

---

## Queries Mongoose

```typescript
// src/lib/trends/repository.ts (adições para o dashboard)

// Dashboard: scored trends (com join de Topic para cor e nome)
export async function getScoredTrends(topicSlug?: string | null, limit = 50) {
  const filter: FilterQuery<ITrend> = {
    score: { $exists: true },
    deletedAt: null,
    ...(topicSlug && { topicSlug }),
  }
  return Trend.find(filter)
    .sort({ 'score.total': -1 })
    .limit(limit)
    .lean()
}

// Dashboard: unscored trends
export async function getUnscoredTrends(topicSlug?: string | null, limit = 50) {
  const filter: FilterQuery<ITrend> = {
    score: { $exists: false },
    deletedAt: null,
    ...(topicSlug && { topicSlug }),
  }
  return Trend.find(filter)
    .sort({ collectedAt: -1 })
    .limit(limit)
    .lean()
}

// Detail page
export async function getTrendById(id: string) {
  if (!isValidObjectId(id)) return null
  return Trend.findOne({ _id: id, deletedAt: null }).lean()
}
```

---

## Join Topic → Trend (cor e nome)

Nenhum `$lookup` no banco — o join é feito na camada de serviço. O `topicSlug` é usado para mapear cor e nome a partir do array de tópicos carregado em paralelo.

```typescript
// src/lib/trends/service.ts
export async function getDashboardData(topicFilter?: string | null) {
  await connectDB()

  const [scored, unscored, topics] = await Promise.all([
    getScoredTrends(topicFilter),
    getUnscoredTrends(topicFilter),
    findAllTopics(),
  ])

  const topicMap = new Map(topics.map(t => [t.slug, t]))

  function enrichTrend<T extends { topicSlug: string }>(trend: T) {
    const topic = topicMap.get(trend.topicSlug)
    return {
      ...trend,
      topicName:  topic?.name  ?? trend.topicSlug,
      topicColor: topic?.color ?? 'blue',
    }
  }

  return {
    scored:   scored.map(enrichTrend),
    unscored: unscored.map(enrichTrend),
  }
}
```

---

## Mapeamento de Badges por Nível

```typescript
// src/lib/scoring/levels.ts (já definido na feature 003)
// Adição: cores para cada nível

export const SCORE_LEVEL_CONFIG = {
  baixo:   { label: 'Baixo',   color: 'gray'   },
  medio:   { label: 'Médio',   color: 'amber'  },
  alto:    { label: 'Alto',    color: 'blue'   },
  critico: { label: 'Crítico', color: 'red'    },
} as const satisfies Record<ScoreLevel, { label: string; color: string }>
```

---

## Diagrama de Componentes por Página

```
src/app/page.tsx  (Server Component — Dashboard)
  ├── TopicFilterBar (Client Component — "use client")
  ├── RankedSection (Server Component)
  │     └── TrendCard × N (Server Component, variant="scored")
  └── AwaitingSection (Server Component, hidden if empty)
        └── TrendCard × N (Server Component, variant="unscored")

src/app/trends/[id]/page.tsx  (Server Component — Detail)
  ├── TrendDetailHeader (Server Component)
  │     ├── título, resumo, link fonte (target="_blank")
  │     ├── TopicBadge (componente de 002)
  │     └── data de coleta
  ├── ScoreDisplay (Server Component — só se trend.score existe)
  │     ├── ScoreBadge (nível + cor)
  │     └── ScoreOriginBadge (manual | IA)
  └── ScoreForm (Client Component — de 003, reutilizado aqui)

src/app/trends/[id]/not-found.tsx  (renderizado pelo notFound())
```
