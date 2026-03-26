# Research: Dashboard & Trend Detail

**Feature**: `004-dashboard-detail`
**Branch**: `001-trend-collection`
**Date**: 2026-03-25

---

## 1. Estratégia de Data Fetching do Dashboard (Server Component)

**Decision**: Server Component com fetch paralelo direto via Mongoose — sem endpoint de API dedicado para o dashboard

**Rationale**: A constitution permite "fetch direto via Mongoose (server-side)" em Server Components. Evitar um roundtrip HTTP extra reduz latência e simplifica o código.

**Pattern**:
```typescript
// src/app/page.tsx (Server Component — é o dashboard)
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { topic?: string }
}) {
  const topicFilter = searchParams.topic ?? null

  // fetch paralelo — não esperar um para começar o outro
  const [scored, unscored, topics] = await Promise.all([
    getScoredTrends(topicFilter),    // service layer
    getUnscoredTrends(topicFilter),
    listTopics(),
  ])

  return (
    <>
      <TopicFilterBar topics={topics} active={topicFilter} />
      <RankedSection trends={scored} />
      <AwaitingSection trends={unscored} />
    </>
  )
}
```

**Queries**:
```typescript
// scored: tem score, ordenado por score.total desc
Trend.find({ 'score': { $exists: true }, deletedAt: null, ...(topic && { topicSlug: topic }) })
     .sort({ 'score.total': -1 })

// unscored: sem score, ordenado por collectedAt desc
Trend.find({ 'score': { $exists: false }, deletedAt: null, ...(topic && { topicSlug: topic }) })
     .sort({ collectedAt: -1 })
```

---

## 2. Migração Automática Após Scoring (FR-007, FR-013)

**Decision**: `router.refresh()` do Next.js App Router após salvar score com sucesso

**Problema**: O `ScoreForm` é um Client Component (interativo). Após o PATCH bem-sucedido, o dashboard e a página de detalhe precisam refletir o novo score sem reload manual.

**Solução no App Router**:
```typescript
'use client'
import { useRouter } from 'next/navigation'

export function ScoreForm({ trendId, defaultValues, ... }) {
  const router = useRouter()

  async function onSubmit(values) {
    const res = await fetch(`/api/trends/${trendId}/score`, { method: 'PATCH', ... })
    if (res.ok) {
      router.refresh()  // re-executa Server Components da página atual com dados frescos
    }
  }
}
```

`router.refresh()` invalida o cache do Router e re-executa os Server Components da página atual, sem navegar ou perder o estado do cliente. O efeito visual é: o score aparece imediatamente na página após salvar.

**Na página de detalhe**: após `router.refresh()`, o Server Component re-busca a tendência do banco e re-renderiza com o score atualizado — incluindo `ScoreDisplay`, `ScoreOriginBadge` e o próprio form (agora pré-preenchido).

---

## 3. Página de Detalhe — Server Component + Client Component Híbrido

**Decision**: Página de detalhe como Server Component; `ScoreForm` como único Client Component

```
/trends/[id]/page.tsx  (Server Component)
├── TrendDetailHeader  (Server Component — título, resumo, URL, fonte, tópico, data)
├── ScoreDisplay       (Server Component — score atual, badge, origem, notas — se avaliado)
└── ScoreForm          (Client Component — "use client" — formulário interativo)
```

**Data fetching na página de detalhe**:
```typescript
// src/app/trends/[id]/page.tsx
import { notFound } from 'next/navigation'

export default async function TrendDetailPage({ params }: { params: { id: string } }) {
  const trend = await getTrendById(params.id)
  if (!trend) notFound()

  return (
    <div>
      <TrendDetailHeader trend={trend} />
      {trend.score && <ScoreDisplay score={trend.score} />}
      <ScoreForm trendId={trend.id} defaultValues={trend.score ?? undefined} />
    </div>
  )
}
```

---

## 4. Página 404 no Next.js App Router (FR-014)

**Decision**: `notFound()` de `next/navigation` + `not-found.tsx` customizado

```typescript
// src/app/trends/[id]/not-found.tsx
export default function TrendNotFound() {
  return (
    <div>
      <h1>Tendência não encontrada</h1>
      <Link href="/">Voltar ao dashboard</Link>
    </div>
  )
}
```

Ao chamar `notFound()` no Server Component, o Next.js renderiza automaticamente o `not-found.tsx` mais próximo na hierarquia de rotas.

---

## 5. Filtro de Tópico no Dashboard via URL

**Decision**: Query param `?topic=infraestrutura` + Client Component para o seletor

Idêntico ao padrão definido na feature 002 (`searchParams` no Server Component + `useRouter/useSearchParams` no Client Component de filtro).

**`TopicFilterBar`** (Client Component):
```typescript
'use client'
import { useRouter, useSearchParams } from 'next/navigation'

export function TopicFilterBar({ topics, active }) {
  const router = useRouter()

  function handleSelect(slug: string | null) {
    const params = new URLSearchParams()
    if (slug) params.set('topic', slug)
    router.push(`/?${params.toString()}`)
  }
}
```

O filtro afeta ambas as seções (ranked + unscored) porque ambas recebem o mesmo `topicFilter` do `searchParams`.

---

## 6. Link para Fonte Original em Nova Aba (FR-008)

```tsx
<a href={trend.url} target="_blank" rel="noopener noreferrer">
  Ver fonte original
  <ExternalLink className="ml-1 h-4 w-4" />  {/* Lucide icon */}
</a>
```

`rel="noopener noreferrer"` é obrigatório para segurança em links `target="_blank"`.

---

## 7. Seção "Aguardando Avaliação" — Exibição Condicional (US02)

**Decision**: A seção é renderizada condicionalmente — oculta se `unscored.length === 0`

```tsx
{unscored.length > 0 && (
  <section>
    <h2>Aguardando avaliação ({unscored.length})</h2>
    <TrendCardList trends={unscored} variant="unscored" />
  </section>
)}
```

Quando todas as tendências estão avaliadas, a seção desaparece naturalmente — sem mensagem "sem itens pendentes" (a ausência já comunica).

---

## 8. Estado Vazio do Dashboard (Edge Case)

**Decision**: Três estados visuais distintos com mensagens orientadoras

| Estado | Condição | Mensagem |
|---|---|---|
| Sem dados | `scored.length === 0 && unscored.length === 0` | "Nenhuma tendência coletada ainda. O sistema coleta diariamente às 07:00 UTC." |
| Sem avaliadas | `scored.length === 0 && unscored.length > 0` | Seção ranked vazia com texto "Nenhuma tendência avaliada. Avalie itens abaixo para que apareçam no ranking." |
| Filtro sem resultado | scores filtrados vazios | "Nenhuma tendência de [Tópico] encontrada." |

---

## 9. Performance do Dashboard (NFR-001: < 2s)

**Garantias**:
- Fetch paralelo de scored + unscored + topics com `Promise.all`
- Índices MongoDB existentes cobrem as queries: `score.total`, `collectedAt`, `topicSlug`
- Server Component — sem waterfall de fetch no cliente
- MVP com equipe interna pequena — volume baixo; sem cache necessário

**Paginação**: Não definida na spec para o dashboard. Para MVP, limitar a 50 scored + 50 unscored evita lentidão com volumes altos. Documentar como tech debt se necessário.
