# Research: Trend Collection

**Feature**: `001-trend-collection`
**Branch**: `001-trend-collection`
**Date**: 2026-03-25

---

## 1. arXiv API

**Decision**: Usar Atom feed XML via `export.arxiv.org/api/query`

**Endpoint e parâmetros**:
```
GET https://export.arxiv.org/api/query
  ?search_query=cat:cs.LG+OR+cat:cs.AR
  &sortBy=submittedDate
  &sortOrder=descending
  &max_results=50
```

**Rate limit**: ~3 req/s sem autenticação. Com `max_results=50` e 1 req/dia, sem problema.

**Campos mapeados**:
- `title` → `entry.title`
- `summary` → `entry.summary` (abstract)
- `url` → `entry.id` (link canônico do paper)
- `source` → `"arXiv"`
- `topicSlug` → `"infraestrutura"` (cs.AR) ou determinado pela config

**Parsing**: Resposta é XML Atom — usar `fast-xml-parser` ou `xml2js`.

---

## 2. HackerNews (Algolia API)

**Decision**: Usar Algolia Search API do HN

**Endpoint**:
```
GET https://hn.algolia.com/api/v1/search
  ?query=artificial+intelligence+OR+machine+learning
  &tags=story
  &numericFilters=created_at_i>TIMESTAMP_24H_AGO
  &hitsPerPage=50
```

**Rate limit**: 10.000 req/h sem autenticação. Sem problema.

**Campos mapeados**:
- `title` → `hit.title`
- `summary` → `hit.story_text` (pode ser null — usar `hit.title` como fallback)
- `url` → `hit.url` (fallback: `https://news.ycombinator.com/item?id=${hit.objectID}`)
- `source` → `"HackerNews"`
- `topicSlug` → `"geral"`

**Nota**: Filtrar hits sem `url` externo (Ask HN, Show HN sem link) — usar URL do HN como fallback para não descartar o item.

---

## 3. Reddit API

**Decision**: Usar endpoint JSON público sem autenticação

**Endpoint**:
```
GET https://www.reddit.com/r/MachineLearning/top.json?t=day&limit=25
GET https://www.reddit.com/r/artificial/top.json?t=day&limit=25
```

**Rate limit**: 60 req/min sem autenticação. User-Agent personalizado é obrigatório para evitar bloqueio.

**Header obrigatório**:
```
User-Agent: IAPulse/1.0 (monitoring bot; contact@company.com)
```

**Campos mapeados**:
- `title` → `post.data.title`
- `summary` → `post.data.selftext` (truncar se > 500 chars; null se link post)
- `url` → `post.data.url`
- `source` → `"Reddit r/MachineLearning"` ou `"Reddit r/artificial"`
- `topicSlug` → `"geral"`

---

## 4. Semantic Scholar API

**Decision**: Usar Graph API pública (sem chave para baixo volume)

**Endpoint**:
```
GET https://api.semanticscholar.org/graph/v1/paper/search
  ?query=artificial+intelligence
  &fields=title,abstract,url,year,publicationDate
  &limit=50
```

**Rate limit**: 100 req/5min sem autenticação. Com 1 req/dia, sem problema.

**Campos mapeados**:
- `title` → `paper.title`
- `summary` → `paper.abstract`
- `url` → `paper.url` (fallback: `https://semanticscholar.org/paper/${paper.paperId}`)
- `source` → `"Semantic Scholar"`
- `topicSlug` → `"infraestrutura"` (papers técnicos)

---

## 5. Papers With Code API

**Decision**: Usar API pública REST sem autenticação

**Endpoint**:
```
GET https://paperswithcode.com/api/v1/papers/?ordering=-published&page_size=50
```

**Rate limit**: Não documentado — usar delay de 1s entre requests para segurança.

**Campos mapeados**:
- `title` → `paper.title`
- `summary` → `paper.abstract`
- `url` → `paper.url_abs` (link para o paper)
- `source` → `"Papers With Code"`
- `topicSlug` → `"infraestrutura"`

---

## 6. RSS Feeds (Adapter Genérico)

**Decision**: Usar `rss-parser` (npm) — biblioteca mais madura para RSS/Atom em Node.js

**Instalação**: `npm install rss-parser`

**Padrão de uso**:
```typescript
import Parser from 'rss-parser'
const parser = new Parser()
const feed = await parser.parseURL(feedUrl)
```

**Campos mapeados** (RSS padrão):
- `title` → `item.title`
- `summary` → `item.contentSnippet` ou `item.content` (truncado a 500 chars)
- `url` → `item.link`
- `source` → nome da fonte da config (`RssFeedConfig.source`)
- `topicSlug` → da config (`RssFeedConfig.topicSlug`)

**Configuração de feeds** (arquivo `rss-feeds.config.ts`):
```typescript
export interface RssFeedConfig {
  url: string
  source: string
  topicSlug: string
}

export const RSS_FEEDS: RssFeedConfig[] = [
  // Infraestrutura
  { url: 'https://developer.nvidia.com/blog/feed', source: 'NVIDIA Developer Blog', topicSlug: 'infraestrutura' },
  { url: 'https://huggingface.co/blog/feed.xml', source: 'Hugging Face Blog', topicSlug: 'infraestrutura' },
  { url: 'https://ai.googleblog.com/feeds/posts/default', source: 'Google AI Blog', topicSlug: 'infraestrutura' },
  // Regulamentação
  { url: 'https://eur-lex.europa.eu/...', source: 'EUR-Lex AI Act', topicSlug: 'regulamentacao' },
  { url: 'https://www.gov.br/anpd/pt-br/feed', source: 'ANPD', topicSlug: 'regulamentacao' },
  { url: 'https://www.nist.gov/artificial-intelligence/rss.xml', source: 'NIST AI', topicSlug: 'regulamentacao' },
  { url: 'https://futureoflife.org/feed/', source: 'Future of Life Institute', topicSlug: 'regulamentacao' },
  { url: 'https://ainowinstitute.org/feed', source: 'AI Now Institute', topicSlug: 'regulamentacao' },
  { url: 'https://hai.stanford.edu/news/rss.xml', source: 'Stanford HAI', topicSlug: 'regulamentacao' },
  // Geral
  { url: 'https://read.deeplearning.ai/the-batch/rss/', source: 'The Batch', topicSlug: 'geral' },
  { url: 'https://jack-clark.net/feed/', source: 'Import AI', topicSlug: 'geral' },
  { url: 'https://venturebeat.com/category/ai/feed/', source: 'VentureBeat AI', topicSlug: 'geral' },
  { url: 'https://www.technologyreview.com/topic/artificial-intelligence/feed', source: 'MIT Technology Review AI', topicSlug: 'geral' },
]
```

**Para adicionar novo tema**: basta criar novo tópico (feature 002) e adicionar entradas no array `RSS_FEEDS` com o novo `topicSlug`.

---

## 7. Deduplicação com MongoDB Upsert

**Decision**: `updateOne` com `upsert: true` usando `url` como filtro

**Pattern**:
```typescript
await Trend.updateOne(
  { url: item.url },
  { $setOnInsert: { ...item, collectedAt: new Date() } },
  { upsert: true }
)
```

`$setOnInsert` garante que itens existentes não sejam modificados — apenas inseridos se não existirem.

**Índice necessário**: `url` com `unique: true` no schema Mongoose.

---

## 8. Vercel Cron Jobs

**Decision**: Declarar em `vercel.json`, proteger com `CRON_SECRET`

**vercel.json**:
```json
{
  "crons": [{ "path": "/api/cron/collect", "schedule": "0 7 * * *" }]
}
```

**Proteção do endpoint**: O Vercel injeta automaticamente o header `Authorization: Bearer <CRON_SECRET>` ao acionar o cron. O endpoint valida esse header.

**Limitação do free tier**: 1 cron job, frequência mínima diária. Suficiente para o caso de uso.

**Timeout**: Functions no Vercel free tier têm timeout de 10s (Hobby) ou 60s (Pro). A coleta de ~15 fontes sequencialmente pode exceder 10s — **usar plano Pro ou configurar `maxDuration` nas funções**.

**Alternativa para timeout**: Executar collectors em paralelo com `Promise.allSettled()` para reduzir tempo total.

---

## 9. Singleton de Conexão MongoDB em Next.js/Serverless

**Decision**: Padrão de cache em variável global para reutilizar conexão entre invocações

**Pattern** (`src/lib/mongodb/client.ts`):
```typescript
import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI!

let cached = global.mongoose as { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

export async function connectDB() {
  if (cached.conn) return cached.conn
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI)
  }
  cached.conn = await cached.promise
  return cached.conn
}
```

**Rationale**: Em ambiente serverless, cada invocação pode ser uma nova instância. O cache em `global` reutiliza a conexão dentro do mesmo container, evitando o overhead de reconexão.

---

## 10. Dependências NPM Necessárias

| Pacote | Versão | Uso |
|---|---|---|
| `mongoose` | latest | ODM MongoDB |
| `rss-parser` | latest | Parsing de feeds RSS/Atom |
| `fast-xml-parser` | latest | Parsing do XML do arXiv |
| `zod` | latest | Validação de schemas (já no Next.js) |

**Nota**: `node-fetch` não necessário — Next.js 14 usa `fetch` nativo do Node.js 18+.
