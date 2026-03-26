# Data Model: Trend Collection

**Feature**: `001-trend-collection`
**Branch**: `001-trend-collection`
**Date**: 2026-03-25

---

## Collections

### `trends`

Armazena cada item de conteúdo coletado de qualquer fonte.

```typescript
// src/lib/mongodb/models/Trend.ts

import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ITrend extends Document {
  title: string
  summary: string
  url: string                // índice único — chave de deduplicação
  source: string             // nome da fonte (ex: "arXiv", "NVIDIA Developer Blog")
  topicSlug: string          // referência ao slug do tópico (ex: "infraestrutura")
  collectedAt: Date
  deletedAt?: Date           // soft delete (constitution §IV)
  score?: {
    maturity: number         // 1-5
    applicability: number    // 1-5
    competitiveImpact: number// 1-5
    strategicAlignment: number// 1-5
    adoptionComplexity: number// 1-5
    total: number            // calculado
    scoredBy: 'manual' | 'llm'
    scoredAt: Date
    notes?: string
  }
}

const TrendSchema = new Schema<ITrend>(
  {
    title:      { type: String, required: true },
    summary:    { type: String, default: '' },
    url:        { type: String, required: true, unique: true },
    source:     { type: String, required: true },
    topicSlug:  { type: String, required: true },
    collectedAt:{ type: Date,   required: true, default: Date.now },
    deletedAt:  { type: Date,   default: null },
    score: {
      maturity:           { type: Number, min: 1, max: 5 },
      applicability:      { type: Number, min: 1, max: 5 },
      competitiveImpact:  { type: Number, min: 1, max: 5 },
      strategicAlignment: { type: Number, min: 1, max: 5 },
      adoptionComplexity: { type: Number, min: 1, max: 5 },
      total:              { type: Number },
      scoredBy:           { type: String, enum: ['manual', 'llm'] },
      scoredAt:           { type: Date },
      notes:              { type: String, default: '' },
    },
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

// Índices
TrendSchema.index({ url: 1 }, { unique: true })               // deduplicação
TrendSchema.index({ topicSlug: 1, collectedAt: -1 })           // filtro + ordenação
TrendSchema.index({ 'score.total': -1 })                        // ranking
TrendSchema.index({ source: 1 })                                // filtro por fonte
TrendSchema.index({ deletedAt: 1 })                             // soft delete queries

export const Trend: Model<ITrend> =
  mongoose.models.Trend ?? mongoose.model<ITrend>('Trend', TrendSchema)
```

---

### `topics`

Armazena os tópicos de monitoramento configurados. Gerenciado pela feature 002.

```typescript
// src/lib/mongodb/models/Topic.ts

import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ITopic extends Document {
  name: string        // exibição (ex: "Infraestrutura")
  slug: string        // identificador único imutável (ex: "infraestrutura")
  description: string
}

const TopicSchema = new Schema<ITopic>(
  {
    name:        { type: String, required: true },
    slug:        { type: String, required: true, unique: true, immutable: true },
    description: { type: String, default: '' },
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

---

## Collector Interface

Contrato que todos os adapters de coleta devem implementar.

```typescript
// src/lib/collectors/types.ts

export interface CollectorResult {
  title: string
  summary: string
  url: string
  source: string
  topicSlug: string
}

export interface CollectorReport {
  source: string
  status: 'success' | 'error'
  itemsCollected: number
  error?: string
}

export type Collector = () => Promise<CollectorResult[]>
```

---

## RSS Feed Config

```typescript
// src/lib/collectors/rss-feeds.config.ts

export interface RssFeedConfig {
  url: string
  source: string
  topicSlug: string
}

export const RSS_FEEDS: RssFeedConfig[] = [
  // Infraestrutura
  { url: 'https://developer.nvidia.com/blog/feed',               source: 'NVIDIA Developer Blog',   topicSlug: 'infraestrutura' },
  { url: 'https://huggingface.co/blog/feed.xml',                 source: 'Hugging Face Blog',        topicSlug: 'infraestrutura' },
  { url: 'https://ai.googleblog.com/feeds/posts/default',        source: 'Google AI Blog',           topicSlug: 'infraestrutura' },
  // Regulamentação
  { url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/RSS/?uri=OJ:C:2024:1689',
                                                                   source: 'EUR-Lex AI Act',          topicSlug: 'regulamentacao' },
  { url: 'https://www.gov.br/anpd/pt-br/feed',                   source: 'ANPD',                     topicSlug: 'regulamentacao' },
  { url: 'https://www.nist.gov/artificial-intelligence/rss.xml', source: 'NIST AI',                  topicSlug: 'regulamentacao' },
  { url: 'https://futureoflife.org/feed/',                        source: 'Future of Life Institute', topicSlug: 'regulamentacao' },
  { url: 'https://ainowinstitute.org/feed',                       source: 'AI Now Institute',         topicSlug: 'regulamentacao' },
  { url: 'https://hai.stanford.edu/news/rss.xml',                source: 'Stanford HAI',             topicSlug: 'regulamentacao' },
  // Geral
  { url: 'https://read.deeplearning.ai/the-batch/rss/',          source: 'The Batch',                topicSlug: 'geral' },
  { url: 'https://jack-clark.net/feed/',                          source: 'Import AI',                topicSlug: 'geral' },
  { url: 'https://venturebeat.com/category/ai/feed/',             source: 'VentureBeat AI',           topicSlug: 'geral' },
  { url: 'https://www.technologyreview.com/topic/artificial-intelligence/feed',
                                                                   source: 'MIT Technology Review AI', topicSlug: 'geral' },
]
```

---

## Seed de Tópicos Iniciais

Script a ser executado uma vez para criar os três tópicos padrão.

```typescript
// src/lib/mongodb/seed-topics.ts

export const INITIAL_TOPICS = [
  {
    name: 'Infraestrutura',
    slug: 'infraestrutura',
    description: 'GPUs, TPUs, edge computing, quantização de modelos e hardware de IA',
  },
  {
    name: 'Regulamentação',
    slug: 'regulamentacao',
    description: 'AI Act (EU), legislação brasileira (PL 2338/ANPD), compliance e frameworks de conformidade',
  },
  {
    name: 'Geral',
    slug: 'geral',
    description: 'Notícias gerais, lançamentos e tendências do mercado de IA',
  },
]
```

---

## Regras de Validação

| Campo | Regra |
|---|---|
| `url` | Obrigatório, único, deve ser URL válida |
| `title` | Obrigatório, não vazio |
| `summary` | Opcional — string vazia se ausente |
| `source` | Obrigatório, não vazio |
| `topicSlug` | Obrigatório; deve corresponder a um tópico cadastrado |
| `score.total` | Calculado — deve estar entre 1,00 e 5,00 |
| `score.scoredBy` | Enum restrito: `'manual'` ou `'llm'` |
| `deletedAt` | Null por padrão; preenchido em soft delete |

---

## Diagrama de Relacionamentos

```
Topic (slug) ←──topicSlug──── Trend
                                └── score (subdocumento, opcional)
```

- `Trend.topicSlug` referencia `Topic.slug` por valor (não por ObjectId) — simplifica queries e é consistente com o padrão de configuração de fontes.
- `score` é um subdocumento embutido em `Trend` — evita joins e simplifica o acesso.
