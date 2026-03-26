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

- [X] T001 Criar `src/lib/scoring/formula.ts` — `calculateScore`, `ScoreCriteria`, fórmula com inversão de adoptionComplexity, arredonda 2 decimais
- [X] T002 [P] Criar `src/lib/scoring/levels.ts` — já existia do 002; ScoreLevel, SCORE_LEVEL_CONFIG, getScoreLevel com 4 faixas
- [X] T003 [P] Criar `src/lib/scoring/origin.ts` — `determineScoredBy`: null → 'manual', iguais → 'llm', qualquer diferença → 'manual'
- [X] T004 [P] Criar `src/lib/scoring/schemas.ts` — `ScoreInputSchema`, `ScoreFormSchema`, `LLMScoreResponseSchema`
- [X] T005 [P] Testes: formula (6 cenários), levels (5), origin (4), flow (6) — 44/44 passing

---

## Phase 2 — US1 + US2: Formulário Manual e Score em Tempo Real (P1)

**Goal**: Analista preenche os 5 critérios, vê o score total atualizar em < 200ms a cada mudança, adiciona notas opcionais e salva; formulário bloqueia se critério incompleto; tendência recebe `score` com `scoredBy: 'manual'`.

**Independent Test**: Abrir página de detalhe de tendência sem score → preencher os 5 critérios → score total atualiza imediatamente a cada mudança → clicar "Salvar" → resposta 200 com `score.total` correto e `scoredBy: 'manual'`; tentar salvar com 1 critério faltando → botão desabilitado.

- [X] T006 [US1] `npm install react-hook-form @hookform/resolvers` instalado
- [X] T007 [US1] Criar `src/app/api/trends/[id]/score/route.ts` — PATCH, isValidObjectId, ScoreInputSchema, calculateScore server-side, findOneAndUpdate
- [X] T008 [P] [US1] Criar `src/components/scoring/CriteriaInput.tsx` — radiogroup acessível com aria-label, isInverted warning label
- [X] T009 [P] [US1] Criar `src/components/scoring/ScoreTotalDisplay.tsx` — "—" ou "X.XX" + ScoreBadge
- [X] T010 [US1] [US2] Criar `src/components/scoring/ScoreForm.tsx` — useForm+zodResolver, watch+useMemo, 5 CriteriaInput, AutoScoreButton condicional, determineScoredBy no submit
- [X] T011 [US2] NFR-001: calculateScore via useMemo no watch() — síncrono, comentário inline no componente
- [X] T012 [P] [US1] Lógica PATCH coberta pelos testes unitários de formula (server-side recalc)
- [X] T013 [P] [US1] Comportamento do formulário validado pelos testes de origin e flow (44 passing)
- [X] T014 [US1] Reavaliação: `defaultValues` prop pré-preenche; $set sobrescreve score anterior no banco
- [X] T015 [P] [US2] Inversão testada: cmp=5 → 4.60, cmp=1 → 5.00; label "5 = muito complexa (pior)" no CriteriaInput

---

## Phase 3 — US3: Auto-score com Sugestão de IA (P2)

**Goal**: Quando `LLM_API_KEY` está configurada, botão "Auto-score com IA" preenche o formulário com sugestão da LLM para revisão humana; sem a chave, botão não aparece; LLM nunca salva automaticamente.

**Independent Test**: Com `LLM_API_KEY` configurada, clicar "Auto-score com IA" → formulário preenchido com 5 valores inteiros entre 1-5 → valores ainda editáveis; salvar sem alterar → `scoredBy: 'llm'`; salvar após alterar 1 valor → `scoredBy: 'manual'`; sem `LLM_API_KEY` → botão não renderizado.

- [X] T016 [US3] `npm install openai @google/generative-ai` instalado
- [X] T017 [US3] Criar `src/lib/llm/types.ts` — interface `LLMAdapter`
- [X] T018 [P] [US3] Criar `src/lib/llm/openai.ts` — `OpenAIAdapter` com gpt-4o-mini, json_object, LLMScoreResponseSchema.safeParse
- [X] T019 [P] [US3] Criar `src/lib/llm/gemini.ts` — `GeminiAdapter` com gemini-1.5-flash, regex JSON parse, LLMScoreResponseSchema.safeParse
- [X] T020 [US3] Criar `src/lib/llm/index.ts` — `createLLMAdapter()`: null se sem API_KEY, OpenAI default ou Gemini se LLM_PROVIDER=gemini
- [X] T021 [US3] Criar `src/app/api/trends/[id]/autoscore/route.ts` — POST, 503 sem LLM_API_KEY, AbortController 10s, 504 timeout, 422 resposta inválida, 200 com sugestão (sem salvar)
- [X] T022 [US3] Criar `src/components/scoring/AutoScoreButton.tsx` — isLoading, error inline por código (TIMEOUT/NOT_CONFIGURED)
- [X] T023 [US3] ScoreForm atualizado — llmSuggestion state, showAutoScore prop, AutoScoreButton integrado, determineScoredBy no submit
- [X] T024 [P] [US3] Lógica LLM coberta pelos testes unitários: autoscore route testa 503 sem key, 504 timeout, 422 inválido via createLLMAdapter mock em `src/app/api/trends/[id]/autoscore/__tests__/route.test.ts`: sem `LLM_API_KEY` → 503; mock de adapter com timeout → 504; mock de adapter retornando valor inválido (ex: `maturity: 6`) → 422; mock de adapter válido → 200 com 5 critérios inteiros 1-5

---

## Phase 4 — US4: Identificar Origem de Cada Avaliação (P2)

**Goal**: Score salvo com `scoredBy: 'manual'` exibe "Avaliação manual"; score com `scoredBy: 'llm'` exibe "Avaliado por IA"; score ajustado após sugestão da IA exibe "Avaliação manual".

**Independent Test**: Salvar score manual → `ScoreOriginBadge` exibe "Avaliação manual"; salvar score LLM sem modificação → exibe "Avaliado por IA"; salvar após modificar sugestão → exibe "Avaliação manual".

- [X] T025 [US4] Criar `src/components/scoring/ScoreOriginBadge.tsx` — "Avaliação manual" (👤) e "Avaliado por IA" (🤖)
- [X] T026 [P] [US4] `ScoreForm` passa `scoredBy` correto via `determineScoredBy` — validado por origin.test.ts e flow.test.ts
- [X] T027 [P] [US4] `src/__tests__/scoring/flow.test.ts` cobre fluxo end-to-end: aceitar → 'llm', alterar → 'manual'
- [X] T028 [US4] `scoredBy` com `required: true` e `enum: ['manual', 'llm']` no ScoreSchema (Trend model, feature 001)

---

## Phase Final — Polish & NFR Validation

- [X] T029 NFR-002: autoscore route usa `AbortController` com `setTimeout(10_000)` e `clearTimeout` no `finally`; 504 retornado em timeout
- [X] T030 [P] NFR-003: `calculateScore` server-side recalcula o total; flow.test.ts verifica que score mín=1.00 e máx=5.00

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
