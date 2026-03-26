# Tasks: Trend Scoring

**Feature**: `003-trend-scoring`
**Branch**: `001-trend-collection`
**Date**: 2026-03-25
**Artifacts**: [spec.md](./spec.md) | [plan.md](./plan.md) | [data-model.md](./data-model.md) | [research.md](./research.md)
**Depends on**: `001-trend-collection` (Trend model com campo `score`), `002-topic-management` (listagem + TopicBadge)

---

## Summary

| Item | Valor |
|---|---|
| Total de tasks | 30 |
| Phase 1 — Foundation | 5 tasks |
| Phase 2 — US1+US2: Formulário Manual + Tempo Real (P1) | 10 tasks |
| Phase 3 — US3: Auto-score com IA (P2) | 9 tasks |
| Phase 4 — US4: Origem da Avaliação (P2) | 4 tasks |
| Phase Final — Polish | 2 tasks |
| Tasks paralelizáveis [P] | 15 |

**MVP mínimo**: Phase 1 + Phase 2 — avaliação manual com score em tempo real.

---

## Dependency Graph

```
Features 001+002 (Trend model, MongoDB client)
    ↓
Phase 1 (Foundation: formula pura, levels, origin, Zod schemas)
    ↓
Phase 2 (US1+US2: PATCH /score → CriteriaInput → ScoreForm com watch()+useMemo)
    ↓
Phase 3 (US3: LLM adapters → POST /autoscore → AutoScoreButton)
    ↓
Phase 4 (US4: ScoreOriginBadge integrado ao ScoreForm → testes de origem)
    ↓
Phase Final (polish, NFR validation)
```

> **US1 e US2 são implementados juntos** na Phase 2 porque o formulário (US1) e o cálculo em tempo real (US2) compartilham o mesmo componente `ScoreForm`. Separar criaria interdependência de componente.

---

## Phase 1 — Foundation

> Lógica pura de scoring sem dependências de UI ou banco. Testável de forma isolada antes de qualquer componente.

- [ ] T001 Criar `src/lib/scoring/formula.ts` — função `calculateScore(criteria: Partial<ScoreCriteria>): number | null`; interface `ScoreCriteria` com 5 campos; fórmula: `mat×0.20 + app×0.30 + imp×0.25 + ali×0.15 + (6-cmp)×0.10`; retorna `null` se qualquer campo for `null/undefined`; arredonda para 2 casas decimais
- [ ] T002 [P] Criar `src/lib/scoring/levels.ts` — tipo `ScoreLevel = 'baixo' | 'medio' | 'alto' | 'critico'`; função `getScoreLevel(total: number): ScoreLevel` com faixas (< 2.50, < 3.50, < 4.50, ≥ 4.50); constante `SCORE_LEVEL_CONFIG` com `{ label, color }` por nível
- [ ] T003 [P] Criar `src/lib/scoring/origin.ts` — função `determineScoredBy(submitted: ScoreCriteria, llmSuggestion: ScoreCriteria | null): 'manual' | 'llm'`; compara todos os 5 campos: se `llmSuggestion` é `null` retorna `'manual'`; se todos os campos são iguais retorna `'llm'`, senão `'manual'`
- [ ] T004 [P] Criar `src/lib/scoring/schemas.ts` — helper `criteriaField = z.number().int().min(1).max(5)`; schemas: `ScoreInputSchema` (5 critérios + `notes?` + `scoredBy` enum), `ScoreFormSchema` (5 critérios + `notes` com default `''`), `LLMScoreResponseSchema` (5 critérios — validação da resposta da LLM)
- [ ] T005 [P] Escrever testes unitários para `formula.ts`, `levels.ts` e `origin.ts` em `src/lib/scoring/__tests__/`: `calculateScore` — todos os valores máximos → 5.00, todos os mínimos → 1.00, incompleto → null, inversão de complexidade (cmp=5 → contribui 0.10×1); `getScoreLevel` — boundaries exatos das 4 faixas; `determineScoredBy` — igual → 'llm', 1 diferença → 'manual', null suggestion → 'manual'

---

## Phase 2 — US1 + US2: Formulário Manual e Score em Tempo Real (P1)

**Goal**: Analista preenche os 5 critérios, vê o score total atualizar em < 200ms a cada mudança, adiciona notas opcionais e salva; formulário bloqueia se critério incompleto; tendência recebe `score` com `scoredBy: 'manual'`.

**Independent Test**: Abrir página de detalhe de tendência sem score → preencher os 5 critérios → score total atualiza imediatamente a cada mudança → clicar "Salvar" → resposta 200 com `score.total` correto e `scoredBy: 'manual'`; tentar salvar com 1 critério faltando → botão desabilitado.

- [ ] T006 [US1] Instalar `npm install react-hook-form @hookform/resolvers` (se ainda não instalado no projeto)
- [ ] T007 [US1] Criar `src/app/api/trends/[id]/score/route.ts` — `PATCH` handler: valida body com `ScoreInputSchema.safeParse()` → 422 se inválido; valida `params.id` com `isValidObjectId()` → 404 se inválido; calcula `total` via `calculateScore()` server-side (dupla verificação); `Trend.findByIdAndUpdate({ _id: id, deletedAt: null }, { $set: { score: { ...criteria, total, scoredAt: new Date() } } }, { new: true })`; retorna 404 se trend não encontrada; retorna 200 com `{ data: { id, score: { ...campos, total, scoredBy, scoredAt } } }`
- [ ] T008 [P] [US1] Criar `src/components/scoring/CriteriaInput.tsx` — Client Component (`"use client"`); recebe `name`, `label`, `value`, `onChange`, `isInverted?: boolean`; renderiza `RadioGroup` do shadcn/ui com 5 opções (1 a 5); quando `isInverted=true`, exibe label explicativo "5 = muito complexa (pior)" abaixo do título do critério; acessível com `aria-label`
- [ ] T009 [P] [US1] Criar `src/components/scoring/ScoreTotalDisplay.tsx` — Client Component; recebe `total: number | null`; quando null: exibe "—" (critérios incompletos); quando preenchido: exibe valor formatado "X.XX" + `ScoreBadge` com nível correspondente (usando `getScoreLevel`)
- [ ] T010 [US1] [US2] Criar `src/components/scoring/ScoreForm.tsx` — Client Component (`"use client"`); recebe `trendId: string`, `defaultValues?: ScoreFormValues`, `onSuccess?: () => void`; `useForm<ScoreFormValues>({ resolver: zodResolver(ScoreFormSchema), defaultValues })`; `const values = watch()`; `const totalScore = useMemo(() => calculateScore(values), [values])`; renderiza 5 `CriteriaInput` (Complexidade com `isInverted=true`), `Textarea` para notas, `ScoreTotalDisplay` com `totalScore`; botão "Salvar" desabilitado quando `totalScore === null` (critério ausente); ao submeter: `determineScoredBy(submitted, llmSuggestion)` → PATCH para `/api/trends/${trendId}/score` → chama `onSuccess()` se 200
- [ ] T011 [US2] Verificar NFR-001 (< 200ms): confirmar que `calculateScore` é invocada via `useMemo` no `watch()` do RHF — a re-renderização é síncrona e ocorre dentro de um frame; sem debounce necessário; adicionar nota inline no componente
- [ ] T012 [P] [US1] Escrever testes de integração para `PATCH /api/trends/[id]/score` em `src/app/api/trends/[id]/score/__tests__/route.test.ts`: body válido → 200 com `score.total` correto; critério fora do range (6) → 422; ID inexistente → 404; `scoredBy: 'manual'` → registrado corretamente
- [ ] T013 [P] [US1] Escrever testes unitários para `ScoreForm.tsx` (usando Testing Library) em `src/components/scoring/__tests__/ScoreForm.test.tsx`: renderizar sem `defaultValues` → botão "Salvar" desabilitado; preencher todos os critérios → botão habilitado; verificar que score exibido corresponde à fórmula; submissão → PATCH chamado com `scoredBy: 'manual'`
- [ ] T014 [US1] Testar edge case de reavaliação: abrir `ScoreForm` com `defaultValues` preenchidos (tendência já avaliada) → todos os campos pré-preenchidos; alterar 1 critério → score atualiza; salvar → `PATCH` chamado com novos valores; verificar que score anterior é sobrescrito no banco
- [ ] T015 [P] [US2] Testar comportamento de inversão de Complexidade de Adoção: definir Complexidade = 5 e demais critérios = 5 → score exibido deve ser 4.60 (não 5.00); definir Complexidade = 1 e demais = 5 → score = 5.00; confirmar que label "5 = muito complexa (pior)" aparece no `CriteriaInput`

---

## Phase 3 — US3: Auto-score com Sugestão de IA (P2)

**Goal**: Quando `LLM_API_KEY` está configurada, botão "Auto-score com IA" preenche o formulário com sugestão da LLM para revisão humana; sem a chave, botão não aparece; LLM nunca salva automaticamente.

**Independent Test**: Com `LLM_API_KEY` configurada, clicar "Auto-score com IA" → formulário preenchido com 5 valores inteiros entre 1-5 → valores ainda editáveis; salvar sem alterar → `scoredBy: 'llm'`; salvar após alterar 1 valor → `scoredBy: 'manual'`; sem `LLM_API_KEY` → botão não renderizado.

- [ ] T016 [US3] Instalar dependências LLM: `npm install openai @google/generative-ai`
- [ ] T017 [US3] Criar `src/lib/llm/types.ts` — interface `LLMAdapter { suggestScore(title: string, summary: string): Promise<LLMScoreResponse> }` onde `LLMScoreResponse` é importado de `src/lib/scoring/schemas.ts`
- [ ] T018 [P] [US3] Criar `src/lib/llm/openai.ts` — classe `OpenAIAdapter implements LLMAdapter`; usa `openai` SDK com `model: 'gpt-4o-mini'` e `response_format: { type: 'json_object' }`; prompt padrão com 5 critérios e instrução de retornar JSON com inteiros 1-5; `max_tokens: 100`; valida resposta com `LLMScoreResponseSchema.safeParse()` — lança `Error('LLM_INVALID_RESPONSE')` se inválido
- [ ] T019 [P] [US3] Criar `src/lib/llm/gemini.ts` — classe `GeminiAdapter implements LLMAdapter`; usa `@google/generative-ai` com `model: 'gemini-1.5-flash'`; mesmo prompt padrão; parse manual do JSON do `result.response.text()`; valida com `LLMScoreResponseSchema.safeParse()`
- [ ] T020 [US3] Criar `src/lib/llm/index.ts` — função `createLLMAdapter(): LLMAdapter | null`; lê `process.env.LLM_API_KEY` e `process.env.LLM_PROVIDER`; retorna `null` se `LLM_API_KEY` ausente; instancia `OpenAIAdapter` se provider `'openai'` (default) ou `GeminiAdapter` se `'gemini'`
- [ ] T021 [US3] Criar `src/app/api/trends/[id]/autoscore/route.ts` — `POST` handler: valida `params.id`; busca trend pelo ID (precisa do título e resumo); `createLLMAdapter()` → retorna 503 com `{ error: { code: 'LLM_NOT_CONFIGURED' } }` se null; `AbortController` com `setTimeout` de 10s; chama `adapter.suggestScore(trend.title, trend.summary)` com `signal`; captura `AbortError` → 504 com `LLM_TIMEOUT`; captura `LLM_INVALID_RESPONSE` → 422; retorna 200 com `{ data: LLMScoreResponse }` (não salva)
- [ ] T022 [US3] Criar `src/components/scoring/AutoScoreButton.tsx` — Client Component; recebe `trendId: string`, `onSuggestion: (data: LLMScoreResponse) => void`; estado `isLoading` e `error`; ao clicar: `POST /api/trends/${trendId}/autoscore`; em sucesso: chama `onSuggestion(data)` (o `ScoreForm` usa isso para chamar `form.reset(suggestion)` e salvar em `llmSuggestion` state); em erro: exibe mensagem inline (timeout, IA indisponível etc.)
- [ ] T023 [US3] Atualizar `ScoreForm.tsx` — adicionar estado `llmSuggestion: ScoreCriteria | null`; prop `showAutoScore: boolean` (true quando `LLM_API_KEY` configurada, verificado server-side e passado como prop); se `showAutoScore`: renderizar `AutoScoreButton` com `onSuggestion={(data) => { setLlmSuggestion(data); form.reset(data) }}`; no submit: `const scoredBy = determineScoredBy(submitted, llmSuggestion)` antes de chamar PATCH
- [ ] T024 [P] [US3] Escrever testes de integração para `POST /api/trends/[id]/autoscore` em `src/app/api/trends/[id]/autoscore/__tests__/route.test.ts`: sem `LLM_API_KEY` → 503; mock de adapter com timeout → 504; mock de adapter retornando valor inválido (ex: `maturity: 6`) → 422; mock de adapter válido → 200 com 5 critérios inteiros 1-5

---

## Phase 4 — US4: Identificar Origem de Cada Avaliação (P2)

**Goal**: Score salvo com `scoredBy: 'manual'` exibe "Avaliação manual"; score com `scoredBy: 'llm'` exibe "Avaliado por IA"; score ajustado após sugestão da IA exibe "Avaliação manual".

**Independent Test**: Salvar score manual → `ScoreOriginBadge` exibe "Avaliação manual"; salvar score LLM sem modificação → exibe "Avaliado por IA"; salvar após modificar sugestão → exibe "Avaliação manual".

- [ ] T025 [US4] Criar `src/components/scoring/ScoreOriginBadge.tsx` — Server Component; recebe `scoredBy: 'manual' | 'llm'`; exibe badge com ícone e label: `manual` → ícone `User` (Lucide) + "Avaliação manual"; `llm` → ícone `Bot` (Lucide) + "Avaliado por IA"; cor neutra (gray) sem juízo de valor
- [ ] T026 [P] [US4] Verificar que `ScoreForm` passa `scoredBy` correto para o PATCH em todos os cenários: (a) formulário manual do zero → `'manual'`; (b) aceitar sugestão LLM sem alterar → `'llm'`; (c) alterar 1 campo da sugestão LLM → `'manual'`; adicionar assertion nos testes existentes de `ScoreForm.test.tsx`
- [ ] T027 [P] [US4] Escrever teste de integração end-to-end do fluxo completo em `src/lib/scoring/__tests__/flow.test.ts`: (1) mock LLM retorna `{ maturity: 3, ... }`; (2) analista não modifica → submit → PATCH com `scoredBy: 'llm'`; (3) analista modifica `maturity` para 4 → submit → PATCH com `scoredBy: 'manual'`
- [ ] T028 [US4] Verificar SC-003 (100% dos scores com origem explícita): inspecionar schema Mongoose de `Trend.score` — confirmar que `scoredBy` tem `required: true` e `enum: ['manual', 'llm']`; confirmar que nenhum código path salva score sem `scoredBy`; verificar no banco com `Trend.countDocuments({ 'score': { $exists: true }, 'score.scoredBy': { $exists: false } })` === 0

---

## Phase Final — Polish & NFR Validation

- [ ] T029 Verificar NFR-002 (timeout LLM < 10s): confirmar que `AbortController` em T021 usa `setTimeout(() => controller.abort(), 10_000)` e que o `clearTimeout` está no `finally`; testar manualmente com mock que demora 11s → 504 recebido pelo cliente
- [ ] T030 [P] Verificar NFR-003 (integridade do score): adicionar assertion nos testes de integração do PATCH: `score.total` retornado deve sempre estar entre 1.00 e 5.00; confirmar que `calculateScore` server-side recalcula e não confia apenas no valor enviado pelo cliente

---

## Parallel Execution Map

| Phase | Paralelas |
|---|---|
| 1 | T002, T003, T004, T005 (após T001) |
| 2 | T008, T009 (após T007); T012, T013, T015 (após T010) |
| 3 | T018, T019 (após T017); T024 (após T021+T022) |
| 4 | T026, T027 (após T025) |

---

## Acceptance Criteria por User Story

| Story | Critério de Conclusão |
|---|---|
| US1 | Formulário incompleto bloqueia save (SC-004); score salvo com `scoredBy: 'manual'` (SC-003) |
| US2 | Score total atualiza em < 200ms (SC-001); fórmula correta para casos de teste (SC-002) |
| US3 | Auto-score preenche sem salvar automaticamente (SC-005); botão ausente sem `LLM_API_KEY` |
| US4 | Score ajustado após IA → `'manual'`; sem ajuste → `'llm'` (SC-006) |
