# Data Model: Topic Management

**Feature**: `002-topic-management`
**Branch**: `001-trend-collection`
**Date**: 2026-03-25
**Depends on**: `001-trend-collection` (models `Trend`, `Topic`)

---

## Alteração no Model `Topic` (feature 001)

O model `Topic` definido na feature 001 recebe o campo `color` para suportar NFR-004 (consistência visual de tags).

```typescript
// src/lib/mongodb/models/Topic.ts (atualização retrocompatível)

import mongoose, { Schema, Document, Model } from 'mongoose'

export const TOPIC_COLOR_PALETTE = [
  'blue', 'emerald', 'violet', 'amber', 'rose',
  'cyan', 'orange', 'teal', 'pink', 'indigo',
] as const

export type TopicColor = typeof TOPIC_COLOR_PALETTE[number]

export interface ITopic extends Document {
  name: string
  slug: string        // imutável (immutable: true)
  description: string
  color: TopicColor   // auto-atribuída na criação
}

const TopicSchema = new Schema<ITopic>(
  {
    name:        { type: String, required: true },
    slug:        { type: String, required: true, unique: true, immutable: true },
    description: { type: String, default: '' },
    color:       { type: String, enum: TOPIC_COLOR_PALETTE, default: 'blue' },
  },
  {
    strict: true,
    toJSON: {
      transform: (_, ret) => {
        ret.id = ret._id.toString()
        delete ret._id
        delete ret.__v
        return ret
      },
    },
  }
)

TopicSchema.index({ slug: 1 }, { unique: true })

export const Topic: Model<ITopic> =
  mongoose.models.Topic ?? mongoose.model<ITopic>('Topic', TopicSchema)
```

**Migração do seed inicial** (tópicos criados sem `color`): O `default: 'blue'` garante que documentos existentes sem o campo sejam tratados como `blue` pelo Mongoose. Para consistência, executar update na primeira inicialização:

```typescript
// script único de migração — executar uma vez
await Topic.updateMany({ color: { $exists: false } }, [
  { $set: { color: { $arrayElemAt: [TOPIC_COLOR_PALETTE, { $mod: [{ $toLong: '$_id' }, TOPIC_COLOR_PALETTE.length] }] } } }
])
```

---

## Zod Schemas de Validação

```typescript
// src/lib/topics/schemas.ts

import { z } from 'zod'
import { TOPIC_COLOR_PALETTE } from '@/lib/mongodb/models/Topic'

export const CreateTopicSchema = z.object({
  name:        z.string().min(2).max(60),
  slug:        z.string().regex(/^[a-z0-9-]+$/, 'slug deve ser lowercase, sem espaços ou caracteres especiais').min(2).max(60).optional(),
  description: z.string().max(500).default(''),
})

export const UpdateTopicSchema = z.object({
  description: z.string().max(500),
})

export type CreateTopicInput  = z.infer<typeof CreateTopicSchema>
export type UpdateTopicInput  = z.infer<typeof UpdateTopicSchema>

// Resposta de tópico ao cliente
export const TopicResponseSchema = z.object({
  id:          z.string(),
  name:        z.string(),
  slug:        z.string(),
  description: z.string(),
  color:       z.enum(TOPIC_COLOR_PALETTE),
})

export type TopicResponse = z.infer<typeof TopicResponseSchema>
```

---

## Zod Schemas para Listagem de Tendências

```typescript
// src/lib/trends/schemas.ts

import { z } from 'zod'

export const TrendFiltersSchema = z.object({
  topic:  z.union([z.string(), z.array(z.string())]).optional(),
  source: z.string().optional(),
  period: z.enum(['1d', '7d', '30d', '90d']).optional(),
  page:   z.coerce.number().int().positive().default(1),
  limit:  z.coerce.number().int().positive().max(100).default(20),
})

export type TrendFilters = z.infer<typeof TrendFiltersSchema>

export const TrendListItemSchema = z.object({
  id:          z.string(),
  title:       z.string(),
  summary:     z.string(),
  url:         z.string(),
  source:      z.string(),
  topicSlug:   z.string(),
  topicColor:  z.string(),        // injetado ao popular o tópico
  collectedAt: z.string(),        // ISO date string
  score: z.object({
    total:    z.number(),
    scoredBy: z.enum(['manual', 'llm']),
  }).nullable(),
})

export type TrendListItem = z.infer<typeof TrendListItemSchema>

export const PaginationSchema = z.object({
  page:       z.number(),
  limit:      z.number(),
  total:      z.number(),
  totalPages: z.number(),
})

export const TrendListResponseSchema = z.object({
  data:       z.array(TrendListItemSchema),
  pagination: PaginationSchema,
})

export type TrendListResponse = z.infer<typeof TrendListResponseSchema>
```

---

## Índices Adicionais (complementando feature 001)

Os índices abaixo já foram declarados no `TrendSchema` da feature 001, listados aqui para referência de queries desta feature:

| Índice | Campo(s) | Uso |
|---|---|---|
| `topicSlug_collectedAt` | `{ topicSlug: 1, collectedAt: -1 }` | Filtro por tópico + ordenação |
| `source` | `{ source: 1 }` | Filtro por fonte |
| `score.total` | `{ 'score.total': -1 }` | Ranking (feature 004) |
| `deletedAt` | `{ deletedAt: 1 }` | Excluir soft-deleted |

---

## Diagrama de Fluxo de Dados

```
GET /api/trends?topic=infraestrutura&source=arXiv&period=7d&page=1
        ↓
  parseTrendFilters(searchParams)
        ↓
  buildTrendQuery(filters) → { topicSlug: 'infraestrutura', source: 'arXiv', collectedAt: { $gte: ... } }
        ↓
  Trend.find(query).skip(0).limit(20).sort({ collectedAt: -1 })
  Trend.countDocuments(query)
        ↓
  joinTopicColor(trends, topics[])   ← injeta topicColor de Topic.color
        ↓
  PaginatedResponse<TrendListItem>


GET /api/topics
        ↓
  Topic.find({}).sort({ name: 1 })
        ↓
  TopicResponse[]


POST /api/topics { name, description }
        ↓
  validateInput(CreateTopicSchema)
        ↓
  generateSlug(name)
        ↓
  autoAssignColor(topicCount)
        ↓
  Topic.create({ name, slug, description, color })
        ↓
  TopicResponse
```
