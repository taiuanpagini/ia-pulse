# Research: Topic Management

**Feature**: `002-topic-management`
**Branch**: `001-trend-collection`
**Date**: 2026-03-25

---

## 1. Cor Consistente de Tags por Tópico (NFR-004)

**Decision**: Armazenar `color` como campo no documento `Topic`

**Rationale**: A cor é atribuída ao tópico, não à página — NFR-004 é explícito nisso. Calcular dinamicamente via hash do slug é uma alternativa, mas impede customização futura. Armazenar no banco é mais flexível e igualmente simples.

**Estratégia de atribuição**: Auto-assign de paleta predefinida no momento da criação. A paleta é um array de cores Tailwind CSS (classes de badge) — a cor é o índice `count % palette.length`.

```typescript
const TOPIC_COLOR_PALETTE = [
  'blue', 'emerald', 'violet', 'amber', 'rose',
  'cyan', 'orange', 'teal', 'pink', 'indigo'
]

// no service de criação:
const topicCount = await Topic.countDocuments()
const color = TOPIC_COLOR_PALETTE[topicCount % TOPIC_COLOR_PALETTE.length]
```

**Representação**: `color` armazena o nome base da cor Tailwind (ex: `"blue"`). O componente de tag monta `bg-${color}-100 text-${color}-800` ou equivalente para dark mode.

**Alternativas descartadas**:
- Hash do slug → não permite customização, pode gerar cores repetidas em slugs similares
- Campo de cor livre (hex) → complexidade de UI desnecessária no MVP

---

## 2. Filtros via Query Params no Next.js App Router

**Decision**: Server Component com `searchParams` prop + query MongoDB dinâmica

**Pattern no App Router**:
```typescript
// src/app/trends/page.tsx (Server Component)
export default async function TrendsPage({
  searchParams,
}: {
  searchParams: { topic?: string; source?: string; period?: string; page?: string }
}) {
  const filters = parseTrendFilters(searchParams)
  const result = await getTrends(filters)
  // ...
}
```

`searchParams` é disponibilizado automaticamente pelo App Router em páginas — sem `useSearchParams` no Server Component.

**Para o componente de filtros** (Client Component, pois usa interatividade):
```typescript
'use client'
import { useRouter, useSearchParams } from 'next/navigation'
```

**Vantagens do Server Component**:
- Sem roundtrip extra ao servidor — dados chegam já filtrados
- SEO-friendly (URL é shareável com filtros)
- Sem estado de loading manual

---

## 3. Opções de Período

**Decision**: Presets predefinidos + persistência via query param `?period=7d`

| Preset | Query param | Cálculo |
|---|---|---|
| Hoje | `1d` | `collectedAt >= now - 24h` |
| Últimos 7 dias | `7d` | `collectedAt >= now - 7d` |
| Últimos 30 dias | `30d` | `collectedAt >= now - 30d` |
| Últimos 90 dias | `90d` | `collectedAt >= now - 90d` |
| Tudo | (ausente) | sem filtro de data |

**Rationale**: Date range customizado é complexidade de UI desnecessária no MVP. Presets cobrem 99% dos casos de uso de monitoramento.

---

## 4. Filtro de Tópicos Múltiplos

**Decision**: Query param `?topic=infraestrutura` (single value para MVP)

**Justificativa**: A spec diz "um ou mais tópicos" mas o caso de uso principal é filtrar por um tópico de cada vez. Para múltiplos, usar `?topic=infraestrutura&topic=regulamentacao` (array de query params), que o Next.js trata automaticamente.

**MongoDB query**:
```typescript
if (topics.length === 1) {
  filter.topicSlug = topics[0]
} else if (topics.length > 1) {
  filter.topicSlug = { $in: topics }
}
```

---

## 5. Paginação Offset-Based (constitution §III)

**Decision**: `?page=1&limit=20` (padrão da constitution)

**Resposta paginada**:
```typescript
interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
```

**MongoDB**:
```typescript
const skip = (page - 1) * limit
const [items, total] = await Promise.all([
  Trend.find(filter).skip(skip).limit(limit).sort({ collectedAt: -1 }),
  Trend.countDocuments(filter),
])
```

---

## 6. Query MongoDB com Filtros Opcionais

**Decision**: Construção dinâmica do objeto de filtro — campos ausentes não são adicionados

```typescript
function buildTrendQuery(filters: TrendFilters): FilterQuery<ITrend> {
  const query: FilterQuery<ITrend> = { deletedAt: null }

  if (filters.topicSlug?.length) {
    query.topicSlug = filters.topicSlug.length === 1
      ? filters.topicSlug[0]
      : { $in: filters.topicSlug }
  }
  if (filters.source) {
    query.source = filters.source
  }
  if (filters.period) {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - Number(filters.period.replace('d', '')))
    query.collectedAt = { $gte: cutoff }
  }

  return query
}
```

---

## 7. Slug: Imutabilidade (NFR-003)

**Decision**: Campo `slug` declarado com `immutable: true` no schema Mongoose

```typescript
slug: { type: String, required: true, unique: true, immutable: true }
```

`immutable: true` no Mongoose impede que o campo seja atualizado mesmo que o `updateOne` tente modificá-lo — garante NFR-003 sem validação manual.

**Geração de slug**: A partir do `name` fornecido, se o slug não for enviado explicitamente:
```typescript
import slugify from 'slugify'  // ou implementação própria
const slug = slugify(name, { lower: true, strict: true })
```

**Alternativa sem dependência**:
```typescript
const slug = name.toLowerCase().normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '')
```

**Decision final**: Implementação própria — evita dependência adicional para uma operação simples.

---

## 8. Listagem de Fontes Disponíveis

**Decision**: Endpoint `GET /api/trends/sources` retorna lista distinta de fontes presentes no banco

```typescript
const sources = await Trend.distinct('source', { deletedAt: null })
```

Isso garante que os filtros de fonte refletem apenas as fontes que têm dados coletados — sem hardcode.

---

## 9. Dependência da Feature 001

Esta feature **depende** do model `Trend` e do model `Topic` definidos na feature 001. A implementação assume:
- `Trend.topicSlug` existe e está indexado
- `Topic.slug` é imutável e único
- Seed dos 3 tópicos iniciais foi executado

A única adição ao model `Topic` é o campo `color` — retrocompatível com o seed da feature 001 (que não inclui `color`; será atribuída na primeira listagem ou em uma migração simples).
