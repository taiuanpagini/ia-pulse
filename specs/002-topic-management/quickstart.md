# Quickstart: Topic Management

**Feature**: `002-topic-management`
**Depends on**: `001-trend-collection` (models Trend e Topic, seed de tópicos)

---

## Pré-requisitos

- Feature 001 implementada (MongoDB conectado, models `Trend` e `Topic` existentes)
- Seed dos tópicos iniciais executado (`src/lib/mongodb/seed-topics.ts`)

---

## 1. Listar Tópicos

```bash
curl http://localhost:3000/api/topics
```

Resposta:
```json
{
  "data": [
    { "id": "...", "name": "Geral", "slug": "geral", "description": "...", "color": "amber" },
    { "id": "...", "name": "Infraestrutura", "slug": "infraestrutura", "description": "...", "color": "blue" },
    { "id": "...", "name": "Regulamentação", "slug": "regulamentacao", "description": "...", "color": "emerald" }
  ]
}
```

---

## 2. Criar Novo Tópico

```bash
curl -X POST http://localhost:3000/api/topics \
  -H "Content-Type: application/json" \
  -d '{"name": "Agentes Autônomos", "description": "LLM agents, AutoGPT, frameworks de orquestração"}'
```

O slug é gerado automaticamente: `"agentes-autonomos"`.
A cor é atribuída automaticamente da paleta.

---

## 3. Atualizar Descrição de Tópico

```bash
curl -X PATCH http://localhost:3000/api/topics/infraestrutura \
  -H "Content-Type: application/json" \
  -d '{"description": "GPUs, TPUs, edge computing, quantização e hardware especializado"}'
```

**Nota**: O slug `infraestrutura` não pode ser alterado (imutável).

---

## 4. Listar Tendências com Filtros

```bash
# Filtrar por tópico
curl "http://localhost:3000/api/trends?topic=infraestrutura"

# Filtrar por fonte
curl "http://localhost:3000/api/trends?source=arXiv"

# Filtrar por período
curl "http://localhost:3000/api/trends?period=7d"

# Combinar filtros
curl "http://localhost:3000/api/trends?topic=regulamentacao&source=EUR-Lex+AI+Act&period=30d"

# Com paginação
curl "http://localhost:3000/api/trends?topic=infraestrutura&page=2&limit=10"
```

---

## 5. Listar Fontes Disponíveis (para popular filtro de fonte)

```bash
curl http://localhost:3000/api/trends/sources
```

Resposta:
```json
{
  "data": ["arXiv", "EUR-Lex AI Act", "HackerNews", "Hugging Face Blog", "NVIDIA Developer Blog"]
}
```

---

## 6. Adicionar Novo Tema de Monitoramento

**Passo 1**: Criar o tópico via API:
```bash
curl -X POST http://localhost:3000/api/topics \
  -H "Content-Type: application/json" \
  -d '{"name": "IA Generativa", "description": "LLMs, diffusion models, multimodal"}'
```

**Passo 2**: Adicionar feeds RSS em `src/lib/collectors/rss-feeds.config.ts`:
```typescript
{ url: 'https://nova-fonte.com/feed', source: 'Nova Fonte', topicSlug: 'ia-generativa' }
```

**Passo 3**: Na próxima execução do cron, tendências serão coletadas e o novo tópico aparecerá automaticamente nos filtros.

---

## 7. Cor de Tags nos Componentes React

A cor armazenada no tópico (`"blue"`, `"emerald"`, etc.) é usada diretamente nos componentes:

```tsx
// src/components/ui/TopicBadge.tsx
interface TopicBadgeProps {
  name: string
  color: string
}

const colorClasses: Record<string, string> = {
  blue:    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  emerald: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  violet:  'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200',
  // ... demais cores da paleta
}

export function TopicBadge({ name, color }: TopicBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClasses[color] ?? colorClasses.blue}`}>
      {name}
    </span>
  )
}
```

O componente `TopicBadge` é o **único lugar** onde a cor é aplicada — garante NFR-004 automaticamente.

---

## Estrutura de Arquivos Relevante

```
src/
  app/
    api/
      topics/
        route.ts               ← GET /api/topics, POST /api/topics
        [slug]/
          route.ts             ← PATCH /api/topics/[slug]
      trends/
        route.ts               ← GET /api/trends (com filtros)
        sources/
          route.ts             ← GET /api/trends/sources
    trends/
      page.tsx                 ← Server Component (listagem com searchParams)
      _components/
        TrendFilters.tsx       ← Client Component (filtros interativos)
        TrendList.tsx          ← Server Component
        TrendCard.tsx          ← Server Component
  lib/
    topics/
      service.ts               ← createTopic, updateTopic, listTopics
      repository.ts            ← acesso direto ao model Topic
      schemas.ts               ← Zod schemas (CreateTopicInput, UpdateTopicInput)
    trends/
      service.ts               ← listTrends, listSources
      repository.ts            ← buildTrendQuery, find com paginação
      schemas.ts               ← TrendFiltersSchema, TrendListResponseSchema
  components/
    ui/
      TopicBadge.tsx           ← componente reutilizável de tag colorida
      ScoreBadge.tsx           ← badge de nível (baixo/médio/alto/crítico)
```
