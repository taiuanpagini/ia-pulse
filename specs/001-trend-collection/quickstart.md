# Quickstart: Trend Collection

**Feature**: `001-trend-collection`
**Stack**: Next.js 14 + MongoDB Atlas + Vercel

---

## Pré-requisitos

- Node.js 18+
- Conta MongoDB Atlas com cluster criado (free tier M0 suficiente)
- Conta Vercel (free tier suficiente para cron diário)
- `npm` instalado

---

## 1. Instalar Dependências

```bash
npm install mongoose rss-parser fast-xml-parser zod
```

---

## 2. Variáveis de Ambiente

Criar `.env.local` na raiz do projeto:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/iapulse?retryWrites=true&w=majority
CRON_SECRET=<string-aleatoria-segura-min-32-chars>
```

No Vercel, configurar as mesmas variáveis em **Settings → Environment Variables**.

---

## 3. Configurar Vercel Cron

Criar `vercel.json` na raiz:

```json
{
  "crons": [
    {
      "path": "/api/cron/collect",
      "schedule": "0 7 * * *"
    }
  ]
}
```

---

## 4. Seed dos Tópicos Iniciais

Executar uma vez para criar os tópicos padrão no banco:

```bash
npx tsx src/lib/mongodb/seed-topics.ts
```

Ou via rota de admin (implementar conforme feature 002).

---

## 5. Testar a Coleta Manualmente

```bash
curl -X POST http://localhost:3000/api/cron/collect \
  -H "Authorization: Bearer <CRON_SECRET>"
```

Resposta esperada:
```json
{
  "ok": true,
  "collectedAt": "2026-03-25T10:00:00.000Z",
  "totalNewItems": 87,
  "sources": [
    { "source": "arXiv", "status": "success", "itemsCollected": 18 },
    { "source": "HackerNews", "status": "success", "itemsCollected": 12 }
  ]
}
```

---

## 6. Testar o Health Check

```bash
curl http://localhost:3000/api/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2026-03-25T10:00:00.000Z"
}
```

---

## 7. Adicionar Nova Fonte RSS (Novo Tema)

**Passo 1**: Criar o tópico no banco via feature 002.

**Passo 2**: Adicionar entrada em `src/lib/collectors/rss-feeds.config.ts`:

```typescript
{
  url: 'https://nova-fonte.com/feed.xml',
  source: 'Nome da Fonte',
  topicSlug: 'slug-do-novo-topico'
}
```

Nenhuma outra alteração de código é necessária. Na próxima execução do cron, a nova fonte será coletada automaticamente.

---

## 8. Adicionar Nova Fonte via API REST (Adapter Dedicado)

Criar `src/lib/collectors/nova-fonte.ts`:

```typescript
import type { CollectorResult } from './types'

export async function collectNovaFonte(): Promise<CollectorResult[]> {
  const response = await fetch('https://api.nova-fonte.com/items')
  const data = await response.json()

  return data.items.map((item: any) => ({
    title: item.title,
    summary: item.abstract ?? '',
    url: item.url,
    source: 'Nova Fonte',
    topicSlug: 'slug-do-topico',
  }))
}
```

Registrar em `src/lib/collectors/index.ts`:

```typescript
import { collectNovaFonte } from './nova-fonte'

export const COLLECTORS = [
  // ... existentes
  collectNovaFonte,
]
```

---

## 9. Monitorar Execuções

Os logs de cada execução ficam disponíveis em:
- **Vercel Dashboard** → Functions → `/api/cron/collect` → Logs
- Cada log contém: fontes tentadas, status por fonte, total de itens coletados

---

## Estrutura de Arquivos Relevante

```
src/
  app/
    api/
      cron/collect/route.ts     ← endpoint de coleta
      health/route.ts           ← health check
  lib/
    collectors/
      types.ts                  ← CollectorResult, CollectorReport, Collector
      arxiv.ts
      hackernews.ts
      reddit.ts
      semantic-scholar.ts
      papers-with-code.ts
      rss.ts                    ← adapter RSS genérico
      rss-feeds.config.ts       ← lista de feeds (adicionar novos aqui)
      index.ts                  ← orquestra todos os collectors
    mongodb/
      client.ts                 ← singleton de conexão
      models/
        Trend.ts
        Topic.ts
      seed-topics.ts

vercel.json                     ← configuração do cron
```
