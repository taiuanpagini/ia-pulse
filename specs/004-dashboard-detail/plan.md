# Implementation Plan: Dashboard & Trend Detail

**Branch**: `001-trend-collection` | **Date**: 2026-03-25 | **Spec**: [spec.md](./spec.md)
**Depends on**: `001` (Trend + Topic models), `002` (TopicBadge, filtros), `003` (ScoreForm, formula, ScoreBadge)

## Summary

Implementar o dashboard principal com duas seções (ranking de avaliadas + backlog "Aguardando avaliação"), filtro por tópico via URL, e a página de detalhe `/trends/[id]` com conteúdo completo e `ScoreForm` inline reutilizado da feature 003. Ambas as páginas são Server Components com fetch paralelo direto via Mongoose. A atualização pós-scoring usa `router.refresh()` para re-executar os Server Components sem reload de página. O único endpoint novo é `GET /api/trends/[id]`.

---

## Technical Context

| Item | Decisão |
|---|---|
| **Dashboard** | Server Component (`src/app/page.tsx`) — fetch direto Mongoose |
| **Detail page** | Server Component (`src/app/trends/[id]/page.tsx`) |
| **Fetch strategy** | `Promise.all([scored, unscored, topics])` — paralelo |
| **Pós-scoring refresh** | `router.refresh()` no callback do `ScoreForm` |
| **Filtro de tópico** | `?topic=slug` via `searchParams` + `TopicFilterBar` (Client) |
| **404** | `notFound()` + `src/app/trends/[id]/not-found.tsx` |
| **Link fonte** | `<a target="_blank" rel="noopener noreferrer">` + ícone Lucide |
| **Componentes reutilizados** | `TopicBadge`, `ScoreBadge`, `ScoreOriginBadge`, `ScoreForm` |
| **Limite MVP** | 50 scored + 50 unscored no dashboard (sem paginação) |

---

## Constitution Check

- [x] Server Components por padrão — `"use client"` apenas em `TopicFilterBar` e `ScoreForm`
- [x] Data fetching no Server Component via Mongoose direto (constitution §IX)
- [x] Sem fetch duplicado — `Promise.all` paralelo para as 3 queries do dashboard
- [x] `notFound()` para ID inexistente — sem try/catch silencioso
- [x] `rel="noopener noreferrer"` obrigatório em links `target="_blank"` (constitution §VII)
- [x] `shadcn/ui` como biblioteca primária — sem componentes UI custom desnecessários
- [x] Lucide React para ícones (constitution §IX)
- [x] Responsividade via prefixos Tailwind `sm:`, `md:`, `lg:` (NFR-004)
- [x] Dark mode via variáveis CSS do shadcn/ui (constitution §IX)
- [x] Loading, erro e estados vazios com padrões consistentes (constitution §IX)
- [x] TypeScript strict — todas as projeções tipadas
- [x] Try/catch em `GET /api/trends/[id]` com erro estruturado

---

## Project Structure

```
specs/004-dashboard-detail/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
    └── trend-detail.yaml

src/
  app/
    page.tsx                          ← Dashboard (Server Component)
    trends/
      [id]/
        page.tsx                      ← Detalhe (Server Component)
        not-found.tsx                 ← 404 customizado
    api/
      trends/
        [id]/
          route.ts                    ← GET /api/trends/[id] (novo nesta feature)
          score/route.ts              ← PATCH (de 003)
          autoscore/route.ts          ← POST (de 003)

  lib/
    trends/
      service.ts                      ← getDashboardData(), getTrendDetail()
      repository.ts                   ← getScoredTrends(), getUnscoredTrends(), getTrendById()

  components/
    dashboard/
      TrendCard.tsx                   ← Server Component (scored e unscored variant)
      RankedSection.tsx               ← Server Component (empty state se scored.length=0)
      AwaitingSection.tsx             ← Server Component (oculto se unscored.length=0)
      TopicFilterBar.tsx              ← "use client" — chips de tópico
      DashboardEmptyState.tsx         ← estado vazio global (sem nenhuma tendência)
    trend/
      TrendDetailHeader.tsx           ← conteúdo completo + link fonte
      ScoreDisplay.tsx                ← score readonly + origem + notas
    scoring/                          ← reutilizado de 003
      ScoreForm.tsx
      CriteriaInput.tsx
      ScoreTotalDisplay.tsx
      AutoScoreButton.tsx
      ScoreOriginBadge.tsx
    ui/                               ← reutilizados de 002 e 003
      TopicBadge.tsx
      ScoreBadge.tsx
```

---

## Architectural Decisions

### Caching
- **Decision**: NO para MVP
- **Justification**: Volume interno pequeno; fetch direto Mongoose com índices é suficiente para NFR-001/002 (< 2s). Documentado como tech debt — avaliar se tráfego aumentar.

### Message Queues / Background Jobs / Event Streaming
- **Decision**: NO — views síncronas.

### Dashboard: API vs. Mongoose Direto
- **Decision**: Fetch direto via Mongoose nos Server Components — sem endpoint dedicado para dashboard
- **Justification**: Elimina roundtrip HTTP desnecessário; dados chegam server-rendered.

### Pós-Scoring: `router.refresh()` vs. Revalidação de Cache
- **Decision**: `router.refresh()` no callback do `ScoreForm`
- **Justification**: Simples, sem configuração adicional; re-executa exatamente os Server Components da página atual com dados frescos. Sem uso de `revalidateTag` ou `revalidatePath` (adiciona complexidade desnecessária no MVP).

---

## Implementation Phases

### Phase 0: Research ✅
- [x] Fetch paralelo via `Promise.all` no Server Component
- [x] `router.refresh()` para atualização pós-scoring sem reload
- [x] Página de detalhe: Server Component + Client Component híbrido
- [x] 404 com `notFound()` + `not-found.tsx`
- [x] Filtro de tópico via `searchParams` (mesmo padrão da feature 002)
- [x] Exibição condicional da seção "Aguardando avaliação"
- [x] Estados vazios do dashboard (3 cenários distintos)
- Resultado: [`research.md`](./research.md)

### Phase 1: Design ✅
- [x] Data model: [`data-model.md`](./data-model.md)
- [x] Contracts: [`contracts/trend-detail.yaml`](./contracts/trend-detail.yaml)
- [x] Quickstart: [`quickstart.md`](./quickstart.md)

### Phase 2: Task Breakdown → `/specforge.tasks`

### Phase 3: Implementation

#### 3.1 — Service e Repository (Dashboard)
1. `repository.ts` — `getScoredTrends(topicSlug?, limit)` e `getUnscoredTrends(topicSlug?, limit)`
2. `repository.ts` — `getTrendById(id)` com validação de ObjectId
3. `service.ts` — `getDashboardData(topicFilter?)`: Promise.all + join com tópicos (enrich com `topicName`, `topicColor`)
4. `service.ts` — `getTrendDetail(id)`: busca trend + enrich com tópico

#### 3.2 — API Route de Detalhe
1. `src/app/api/trends/[id]/route.ts` — `GET`:
   - Valida ObjectId
   - Chama `getTrendDetail(id)`
   - Retorna 404 se não encontrado, 200 com detalhe enriquecido

#### 3.3 — Componentes de Dashboard
1. `TrendCard.tsx` — card responsivo com `TopicBadge`, `ScoreBadge`, score e data
2. `RankedSection.tsx` — título "Ranking", lista de cards, empty state "Nenhuma tendência avaliada"
3. `AwaitingSection.tsx` — título "Aguardando avaliação (N)", lista de cards, hidden if empty
4. `TopicFilterBar.tsx` — chips clicáveis por tópico, "use client", `router.push` com query param
5. `DashboardEmptyState.tsx` — estado vazio global com mensagem orientadora

#### 3.4 — Página do Dashboard
1. `src/app/page.tsx` — Server Component:
   - `searchParams` → `topicFilter`
   - `getDashboardData(topicFilter)` → scored + unscored
   - `listTopics()` (para `TopicFilterBar`)
   - Layout com `TopicFilterBar`, `RankedSection`, `AwaitingSection`

#### 3.5 — Componentes de Detalhe
1. `TrendDetailHeader.tsx` — título, resumo, link `target="_blank"` (ícone ExternalLink), fonte, `TopicBadge`, data
2. `ScoreDisplay.tsx` — layout readonly: `ScoreBadge`, score total, `ScoreOriginBadge`, notas

#### 3.6 — Página de Detalhe
1. `src/app/trends/[id]/page.tsx` — Server Component:
   - `getTrendDetail(params.id)` → `notFound()` se null
   - Layout: `TrendDetailHeader` + (`ScoreDisplay` se avaliada) + `ScoreForm` com `defaultValues`
   - `ScoreForm` recebe `onSuccess={() => router.refresh()}` via prop
2. `src/app/trends/[id]/not-found.tsx` — layout com título, mensagem, `<Link href="/">Voltar ao dashboard</Link>`

#### 3.7 — Ajuste no ScoreForm (integração com router.refresh)
1. Adicionar prop `onSuccess?: () => void` ao `ScoreForm` de 003
2. Chamar `onSuccess()` após PATCH bem-sucedido (a página de detalhe passa `router.refresh`)

#### 3.8 — Testes
1. Unit: `getScoredTrends` e `getUnscoredTrends` (com e sem filtro de tópico)
2. Unit: `enrichTrend` (join com topicMap)
3. Integration: `GET /api/trends/[id]` — 200, 404, ObjectId inválido
4. E2E (manual): fluxo completo avaliar → migrar para ranking

---

## Dependências Entre Tasks

```
3.1 (service/repo) → 3.2 (API route) → 3.8 (tests)
                  → 3.3 (componentes dashboard) → 3.4 (página dashboard)
                  → 3.5 (componentes detalhe)  → 3.6 (página detalhe)
3.7 (ajuste ScoreForm) → 3.6
```

---

## Riscos e Mitigações

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Volume de tendências cresce e dashboard fica lento | Baixa (MVP) | Limite de 50 por seção; índices cobrem as queries |
| `router.refresh()` causa flash visual indesejado | Baixa | Adicionar loading indicator no `ScoreForm` enquanto salva |
| ObjectId inválido causa crash no Mongoose | Média | Validar com `isValidObjectId()` antes de query; retornar 404 |
| Tópico sem tendências após filtro | Baixa | Ambas as seções têm empty state individual |
| ScoreForm de 003 sem prop `onSuccess` | — | Task 3.7 adiciona a prop de forma retrocompatível (opcional) |

---

## Critérios de Conclusão da Feature

- [ ] SC-001: Ranking exibe tendências em ordem decrescente de score
- [ ] SC-002: Badge de nível de cada tendência corresponde à faixa correta — 100%
- [ ] SC-003: Tendências sem score aparecem exclusivamente em "Aguardando avaliação"
- [ ] SC-004: Após avaliar, tendência migra para o ranking sem reload manual
- [ ] SC-005: Dashboard e detalhe carregam em < 2s
- [ ] SC-006: Mesmo tópico exibe sempre a mesma cor de tag em todo o sistema
