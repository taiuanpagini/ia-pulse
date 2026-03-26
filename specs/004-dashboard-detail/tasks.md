# Tasks: Dashboard & Trend Detail

**Feature**: `004-dashboard-detail`
**Branch**: `001-trend-collection`
**Date**: 2026-03-25
**Artifacts**: [spec.md](./spec.md) | [plan.md](./plan.md) | [data-model.md](./data-model.md) | [research.md](./research.md)
**Depends on**: Features 001–003 completamente implementadas (Trend, Topic, ScoreForm, formula, levels)

---

## Summary

| Item | Valor |
|---|---|
| Total de tasks | 28 |
| Phase 1 — Foundation | 5 tasks |
| Phase 2 — US1+US2: Dashboard (Ranking + Backlog) (P1) | 8 tasks |
| Phase 3 — US3: Filtro por Tópico (P1) | 4 tasks |
| Phase 4 — US4: Página de Detalhe (P1) | 6 tasks |
| Phase 5 — US5: ScoreForm Inline + Migração (P1) | 3 tasks |
| Phase Final — Polish | 2 tasks |
| Tasks paralelizáveis [P] | 13 |

**MVP mínimo**: Phase 1 + Phase 2 — dashboard com ranking e backlog visíveis.

---

## Dependency Graph

```
Features 001–003 (Trend, Topic, score, ScoreForm, formula, levels, TopicBadge, ScoreBadge)
    ↓
Phase 1 (Foundation: service getDashboardData + getTrendDetail, repo, GET /api/trends/[id])
    ↓
Phase 2 (US1+US2: TrendCard + RankedSection + AwaitingSection + page.tsx)
    ↓
Phase 3 (US3: TopicFilterBar Client Component + integração com searchParams)
    ↓              ↓
Phase 4 (US4: TrendDetailHeader + ScoreDisplay + not-found + /trends/[id]/page.tsx)
    ↓
Phase 5 (US5: ScoreForm inline + onSuccess prop + router.refresh)
    ↓
Phase Final (polish, NFR validation)
```

> **US1 e US2 juntos**: o ranking (US1) e o backlog (US2) estão na mesma página e compartilham o mesmo fetch de dados — separar criaria duas tasks de page.tsx para o mesmo arquivo.
>
> **Phase 3 pode ser paralelizada com Phase 4** após a Phase 2 estar concluída.

---

## Phase 1 — Foundation

> Service e repository para o dashboard, enriquecimento de dados com tópico, e endpoint GET /api/trends/[id]. Pré-requisito bloqueante para todas as fases seguintes.

- [ ] T001 Adicionar funções ao `src/lib/trends/repository.ts` — `getScoredTrends(topicSlug?: string | null, limit?: number): Promise<LeanTrend[]>` com filtro `{ 'score': { $exists: true }, deletedAt: null }`, sort `{ 'score.total': -1 }`, limit 50; `getUnscoredTrends(topicSlug?, limit?)` com filtro `{ 'score': { $exists: false }, deletedAt: null }`, sort `{ collectedAt: -1 }`, limit 50; `getTrendById(id: string)` com validação `isValidObjectId(id)` antes da query
- [ ] T002 Criar `src/lib/trends/service.ts` (adições) — função `getDashboardData(topicFilter?: string | null)`: conecta ao DB via `connectDB()`; executa `Promise.all([getScoredTrends(topicFilter), getUnscoredTrends(topicFilter), findAllTopics()])`; mapeia cor e nome via `topicMap`; injeta `topicColor`, `topicName` e `level` (via `getScoreLevel`) em cada scored trend; retorna `{ scored: ScoredTrendCard[], unscored: UnscoredTrendCard[] }`
- [ ] T003 Criar `src/lib/trends/service.ts` (adições) — função `getTrendDetail(id: string): Promise<TrendDetail | null>`: chama `getTrendById(id)` → null se não encontrado ou ID inválido; busca tópico via `findTopicBySlug(trend.topicSlug)`; injeta `topicName`, `topicColor`, e se `trend.score` existir adiciona `level` via `getScoreLevel(trend.score.total)`; retorna `TrendDetail`
- [ ] T004 [P] Criar `src/app/api/trends/[id]/route.ts` — `GET` handler: valida `params.id` com `isValidObjectId()` → 404 imediato se inválido; chama `getTrendDetail(params.id)`; retorna 404 com `{ error: { code: 'TREND_NOT_FOUND' } }` se null; retorna 200 com `{ data: TrendDetail }`; try/catch com erro estruturado; adicionar `TrendDetailResponseSchema` de `src/lib/trends/schemas.ts`
- [ ] T005 [P] Escrever testes de integração para `GET /api/trends/[id]` em `src/app/api/trends/[id]/__tests__/route.test.ts`: ID válido com trend existente → 200 com `topicColor`, `topicName` e `level` injetados; ID válido sem trend → 404; string não-ObjectId (ex: "abc") → 404; trend com score → `data.score.level` presente; trend sem score → `data.score === null`

---

## Phase 2 — US1 + US2: Ranking e Backlog no Dashboard (P1)

**Goal**: Dashboard exibe tendências avaliadas ordenadas por score (maior primeiro) com badges de nível; tendências sem score aparecem em seção separada ordenadas por data; sem nenhuma tendência exibe estado vazio orientador.

**Independent Test**: Acessar `http://localhost:3000/` com 3 tendências avaliadas (scores 4.5, 3.0, 1.8) e 2 não avaliadas → ranking exibe na ordem 4.5 → 3.0 → 1.8 com badges Crítico/Médio/Baixo; as 2 não avaliadas aparecem em "Aguardando avaliação" sem aparecer no ranking.

- [ ] T006 [US1] Criar `src/components/dashboard/TrendCard.tsx` — Server Component; aceita prop `variant: 'scored' | 'unscored'`; layout responsivo: título como `<Link href="/trends/${id}">`, `TopicBadge` com `name` e `color`, nome da fonte, data formatada (`collectedAt`); se `variant='scored'`: exibe `ScoreBadge` com `total` e `level`, score formatado "X.XX"; se `variant='unscored'`: badge cinza "Não avaliado" em vez do score
- [ ] T007 [P] [US1] Criar `src/components/dashboard/RankedSection.tsx` — Server Component; recebe `trends: ScoredTrendCard[]`; título "Ranking de Tendências"; se array vazio: empty state "Nenhuma tendência avaliada ainda — avalie itens abaixo para que apareçam aqui" com ícone `BarChart2` (Lucide); lista de `TrendCard` com `variant='scored'`
- [ ] T008 [P] [US2] Criar `src/components/dashboard/AwaitingSection.tsx` — Server Component; recebe `trends: UnscoredTrendCard[]`; se `trends.length === 0`: não renderiza nada (retorna `null`); título "Aguardando avaliação ({trends.length})"; lista de `TrendCard` com `variant='unscored'`
- [ ] T009 [P] [US1] [US2] Criar `src/components/dashboard/DashboardEmptyState.tsx` — Server Component; exibido quando `scored.length === 0 && unscored.length === 0`; mensagem: "Nenhuma tendência coletada ainda. O sistema coleta diariamente às 07:00 UTC." com ícone `Inbox` (Lucide) e link para acionar coleta manualmente (doc)
- [ ] T010 [US1] [US2] Criar `src/app/page.tsx` — Server Component (substitui página default do Next.js); recebe `searchParams: { topic?: string }`; chama `getDashboardData(searchParams.topic ?? null)` e `listTopics()` via `Promise.all`; se `scored.length === 0 && unscored.length === 0`: renderiza `DashboardEmptyState`; senão: `<TopicFilterBar topics={topics} active={searchParams.topic} />` + `<RankedSection trends={scored} />` + `<AwaitingSection trends={unscored} />`
- [ ] T011 [P] [US2] Verificar cenário US2 "Seção vazia quando todas avaliadas": com `unscored = []`, `AwaitingSection` retorna `null` — confirmar que a seção não ocupa espaço visual; testar renderização do Server Component com mock de `getDashboardData` retornando `{ scored: [...], unscored: [] }` via teste unitário de componente
- [ ] T012 [P] [US1] Escrever testes unitários para `getDashboardData` em `src/lib/trends/__tests__/service.test.ts`: mock de `getScoredTrends`, `getUnscoredTrends` e `findAllTopics` → verificar que `topicColor`, `topicName` e `level` são injetados corretamente; `level` deve ser `'critico'` para score 4.8, `'alto'` para 3.7 etc.; tópico não encontrado no map → fallback `color: 'blue'`, `name: topicSlug`
- [ ] T013 [US2] Verificar SC-003 (tendências sem score nunca no ranking): query `getScoredTrends` usa `{ 'score': { $exists: true } }` — confirmar no teste de integração ou com `.explain()` que apenas trends com score são retornadas; `getUnscoredTrends` usa `{ 'score': { $exists: false } }` — mesma verificação

---

## Phase 3 — US3: Filtrar Ranking por Tópico (P1)

**Goal**: Seletor de tópico atualiza a URL com `?topic=slug` → Server Component re-renderiza ambas as seções filtradas; remover filtro restaura visão completa.

**Independent Test**: Dashboard com tópicos "Infraestrutura" e "Regulamentação"; selecionar "Regulamentação" → URL muda para `/?topic=regulamentacao` → apenas tendências de regulamentação aparecem em ambas as seções; clicar "Todos" → URL volta para `/` → visão completa restaurada.

- [ ] T014 [US3] Criar `src/components/dashboard/TopicFilterBar.tsx` — Client Component (`"use client"`); recebe `topics: ITopic[]` e `active?: string`; usa `useRouter()` e `useSearchParams()`; renderiza chip "Todos" (ativo quando `active` é null/undefined) + chip por tópico com `TopicBadge`; ao clicar chip: `router.push(slug ? '/?topic=' + slug : '/')`; chip ativo visualmente destacado (border ou background diferente)
- [ ] T015 [P] [US3] Verificar que filtro afeta ambas as seções: em `src/app/page.tsx` o `topicFilter` do `searchParams` é passado para `getDashboardData` — que por sua vez passa para `getScoredTrends(topicFilter)` e `getUnscoredTrends(topicFilter)`; adicionar teste com filtro: mock de `getDashboardData('infraestrutura')` → verificar que queries MongoDB incluem `{ topicSlug: 'infraestrutura' }`
- [ ] T016 [P] [US3] Verificar cenário "filtro com tópico sem tendências avaliadas": `getScoredTrends('topico-novo')` retorna `[]` → `RankedSection` exibe empty state; `getUnscoredTrends('topico-novo')` pode retornar items → `AwaitingSection` exibe normalmente; confirmar que não é exibido erro — apenas empty state do ranking
- [ ] T017 [US3] Verificar cenário "remover filtro": `TopicFilterBar` ao clicar "Todos" faz `router.push('/')` sem query params; confirmar que `searchParams.topic` se torna `undefined` e `getDashboardData(null)` é chamado sem filtro — todas as tendências retornam

---

## Phase 4 — US4: Página de Detalhe Completo (P1)

**Goal**: Página `/trends/[id]` exibe conteúdo completo da tendência com link para fonte em nova aba; tendência já avaliada exibe score atual; ID inexistente renderiza página 404 customizada com link de retorno.

**Independent Test**: Acessar `/trends/<ID_VALIDO>` → título, resumo completo, link "Ver fonte original" que abre em nova aba, `TopicBadge`, fonte e data visíveis; se avaliada: `ScoreBadge` + origem visíveis; acessar `/trends/000000000000000000000000` → página 404 customizada com "Voltar ao dashboard".

- [ ] T018 [US4] Criar `src/components/trend/TrendDetailHeader.tsx` — Server Component; recebe campos de `TrendDetail`; layout: título em `<h1>`, resumo completo em `<p>` (sem truncamento), `<a href={url} target="_blank" rel="noopener noreferrer">` com texto "Ver fonte original" e ícone `ExternalLink` (Lucide), `TopicBadge` com `topicName` e `topicColor`, nome da fonte, data de coleta formatada
- [ ] T019 [P] [US4] Criar `src/components/trend/ScoreDisplay.tsx` — Server Component; recebe `score: TrendDetail['score']` (pode ser null); se null: retorna null (não renderiza nada); se score: layout readonly com `ScoreBadge` (nível + cor), score total "X.XX / 5.00", `ScoreOriginBadge` (manual/IA), notas (se presentes), e tabela com os 5 critérios e seus valores — não é formulário
- [ ] T020 [P] [US4] Criar `src/app/trends/[id]/not-found.tsx` — renderizado automaticamente pelo `notFound()` do Next.js; layout centralizado com ícone `SearchX` (Lucide), título "Tendência não encontrada", mensagem "O conteúdo que você procura não existe ou foi removido", `<Link href="/">← Voltar ao dashboard</Link>`
- [ ] T021 [US4] Criar `src/app/trends/[id]/page.tsx` — Server Component; `params: { id: string }`; chama `getTrendDetail(params.id)` via `connectDB()` + service; se null: `notFound()` (Next.js renderiza `not-found.tsx`); renderiza: `<TrendDetailHeader trend={detail} />` + (`<ScoreDisplay score={detail.score} />` se `detail.score`) + `<ScoreForm ... />` (placeholder por ora — integrado na Phase 5)
- [ ] T022 [P] [US4] Verificar link em nova aba: confirmar que `TrendDetailHeader` usa `target="_blank" rel="noopener noreferrer"` no link da fonte; adicionar snapshot test ou verificação de atributos; verificar que trends sem URL (campo vazio) exibem mensagem "URL não disponível" em vez de link quebrado
- [ ] T023 [P] [US4] Verificar SC-004 (migração após avaliar): verificar que ao voltar do detalhe para o dashboard (`router.back()` ou link "←") a página do dashboard é re-carregada com dados frescos — no Next.js App Router, navegação entre rotas causa re-fetch dos Server Components; confirmar comportamento com teste manual ou snapshot

---

## Phase 5 — US5: ScoreForm Inline + Migração Automática (P1)

**Goal**: Formulário de avaliação disponível inline na página de detalhe; após salvar, score aparece imediatamente sem reload; tendência migra do backlog para o ranking ao voltar ao dashboard.

**Independent Test**: Abrir detalhe de tendência sem score → `ScoreForm` visível; preencher e salvar → `ScoreDisplay` aparece na mesma página com novo score e origem; voltar ao dashboard → tendência aparece no ranking na posição correta e desaparece de "Aguardando avaliação".

- [ ] T024 [US5] Atualizar `src/components/scoring/ScoreForm.tsx` — adicionar prop opcional `onSuccess?: () => void` ao componente; chamar `onSuccess?.()` após PATCH com 200 bem-sucedido; garantir retrocompatibilidade (prop opcional, nenhuma chamada existente quebra)
- [ ] T025 [US5] Atualizar `src/app/trends/[id]/page.tsx` — integrar `ScoreForm` completamente: importar `ScoreForm` de features 003; adicionar `'use client'`-aware wrapper se necessário ou passar como Client Component via slot; criar `TrendDetailClient.tsx` (Client Component) que recebe `trendId`, `defaultValues`, `showAutoScore` e encapsula `ScoreForm` com `const router = useRouter()` e `onSuccess={() => router.refresh()}`; `router.refresh()` invalida cache do Router e re-executa o Server Component com dados frescos (mostra novo `ScoreDisplay`)
- [ ] T026 [US5] Verificar SC-004 (migração sem reload): testar fluxo completo manualmente — (1) dashboard mostra trend em "Aguardando avaliação"; (2) clicar → detalhe abre; (3) preencher e salvar → `ScoreDisplay` aparece sem navegar; (4) voltar ao dashboard → trend está no ranking; (5) seção "Aguardando avaliação" não mostra mais a trend; confirmar que `router.refresh()` é suficiente sem `revalidatePath`

---

## Phase Final — Polish & NFR Validation

- [ ] T027 Verificar NFR-001 e NFR-002 (performance < 2s): dashboard com 50 scored + 50 unscored deve carregar em < 2s — confirmar que `Promise.all` paralelo é usado (não sequencial); página de detalhe com score deve carregar em < 2s; adicionar `console.time('dashboard')` temporariamente em dev e medir; confirmar que índices `score.total`, `collectedAt` e `topicSlug` do TrendSchema são usados nas queries
- [ ] T028 [P] Verificar NFR-003 e NFR-004: (a) mesma cor de tópico em dashboard e detalhe — `TopicBadge` recebe `color` de `Topic.color` do banco, não calculada — SC-006 garantido pelo componente único; (b) responsividade — verificar layout em viewport 768px (tablet): cards do dashboard em grid de 1 coluna em `sm:` e 2 colunas em `md:`; página de detalhe legível em 768px; testar com DevTools

---

## Parallel Execution Map

| Phase | Paralelas |
|---|---|
| 1 | T004, T005 (após T001+T002+T003) |
| 2 | T007, T008, T009 (após T006); T011, T012 (após T010) |
| 3 | T015, T016, T017 (após T014); Phase 3 e Phase 4 podem rodar em paralelo após Phase 2 |
| 4 | T019, T020, T022 (após T018); T023 (após T021) |
| Final | T027, T028 em paralelo |

---

## Acceptance Criteria por User Story

| Story | Critério de Conclusão |
|---|---|
| US1 | Ranking em ordem decrescente de score; badge de nível 100% correto (SC-001, SC-002) |
| US2 | Sem score → apenas em "Aguardando avaliação"; seção oculta quando vazia (SC-003) |
| US3 | Filtro afeta ambas as seções; remover filtro restaura visão completa |
| US4 | Detalhe exibe todos os campos; link abre em nova aba; 404 para ID inválido (FR-008, FR-014) |
| US5 | Score aparece imediatamente após salvar; migração para ranking sem reload (SC-004) |
