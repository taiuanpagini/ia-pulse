# Implementation Plan: Trend Scoring

**Branch**: `001-trend-collection` | **Date**: 2026-03-25 | **Spec**: [spec.md](./spec.md)
**Depends on**: `001-trend-collection` (campo `score` em Trend), `002-topic-management` (listagem)

## Summary

Implementar o sistema de avaliação ponderada de tendências com fórmula de 5 critérios (pesos fixos, Complexidade de Adoção invertida na fórmula), cálculo em tempo real via React Hook Form + `useMemo`, modo manual e modo LLM opcional com detecção automática de modificação para determinar a origem do score. A LLM roda server-side para proteger a chave de API; o cliente apenas chama `/autoscore` e preenche o formulário com a sugestão para revisão humana.

---

## Technical Context

| Item | Decisão |
|---|---|
| **Fórmula** | `formula.ts` — fonte única; Complexidade invertida `(6 - adoptionComplexity) × 0.10` |
| **UI de critérios** | shadcn/ui `RadioGroup` (1-5 com labels explícitos por critério) |
| **Cálculo em tempo real** | `watch()` RHF + `useMemo(calculateScore, [values])` |
| **Origem do score** | Comparação de submitted vs. llmSuggestion no submit |
| **LLM** | Server-side API Route; provider via `LLM_PROVIDER` env var |
| **LLM OpenAI** | `gpt-4o-mini` + `response_format: json_object` |
| **LLM Gemini** | `gemini-1.5-flash` + parse manual do JSON |
| **Timeout LLM** | `AbortController` 10s server-side; 504 ao cliente |
| **Formulário** | React Hook Form + `zodResolver(ScoreFormSchema)` |
| **Pré-preenchimento** | `defaultValues` do RHF com score atual da tendência |

---

## Constitution Check

- [x] TypeScript strict — todas as funções tipadas (`ScoreCriteria`, `ScoreInput`, `LLMAdapter`)
- [x] Zod em todas as API Routes (`ScoreInputSchema`, `LLMScoreResponseSchema`)
- [x] `formula.ts` é a única fonte de verdade para cálculo (constitution §VI)
- [x] `scoredBy` sempre `'manual'` ou `'llm'` após salvar — nunca `null` (constitution §VI)
- [x] `LLM_API_KEY` exclusivamente server-side — nunca `NEXT_PUBLIC_` (constitution §VII)
- [x] LLM ativada somente via env var — código funciona sem ela (constitution §VI)
- [x] Try/catch em todas as API Routes com resposta estruturada
- [x] `"use client"` apenas em `ScoreForm.tsx` e subcomponentes interativos
- [x] shadcn/ui como biblioteca primária (`RadioGroup`, `Textarea`, `Button`)
- [x] React Hook Form + Zod + shadcn `<Form>` (constitution §IX)
- [x] Loading, erro e estados vazios tratados (loader no botão auto-score, mensagem de timeout)
- [x] Responsividade com prefixos Tailwind

---

## Project Structure

```
specs/003-trend-scoring/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
    └── score.yaml

src/
  app/
    api/
      trends/
        [id]/
          score/
            route.ts          ← PATCH /api/trends/[id]/score
          autoscore/
            route.ts          ← POST /api/trends/[id]/autoscore
  lib/
    scoring/
      formula.ts              ← calculateScore() + ScoreCriteria interface
      levels.ts               ← getScoreLevel() + ScoreLevel type
      origin.ts               ← determineScoredBy()
      schemas.ts              ← ScoreInputSchema, ScoreFormSchema, LLMScoreResponseSchema
    llm/
      types.ts                ← interface LLMAdapter + LLMScoreResponse
      index.ts                ← createLLMAdapter() factory
      openai.ts               ← OpenAIAdapter (gpt-4o-mini)
      gemini.ts               ← GeminiAdapter (gemini-1.5-flash)
  components/
    scoring/
      ScoreForm.tsx           ← "use client" — orquestra o formulário completo
      CriteriaInput.tsx       ← RadioGroup 1-5 por critério (com label invertido para complexidade)
      ScoreTotalDisplay.tsx   ← exibe total + badge de nível em tempo real
      AutoScoreButton.tsx     ← botão com loading/error state
      ScoreOriginBadge.tsx    ← "Avaliação manual" | "Avaliado por IA"
```

---

## Architectural Decisions

### Caching
- **Decision**: NO — formulário pontual, sem leituras repetidas.

### Message Queues / Background Jobs
- **Decision**: NO — score é síncrono; auto-score é awaited na mesma interação.

### LLM Integration
- **Decision**: YES — opcional, ativada por `LLM_API_KEY` + `LLM_PROVIDER`
- **Providers**: OpenAI (`gpt-4o-mini`) e Gemini (`gemini-1.5-flash`)
- **Timeout**: 10s com `AbortController` server-side
- **Fallback**: sem chave → endpoint retorna 503; botão não exibido no frontend

---

## Implementation Phases

### Phase 0: Research ✅
- [x] Cálculo em tempo real: `watch()` + `useMemo` com função pura
- [x] Lógica de inversão do critério Complexidade de Adoção na fórmula
- [x] Determinação de origem: comparação de submitted vs. llmSuggestion
- [x] LLM server-side: OpenAI e Gemini, factory pattern, timeout AbortController
- [x] Validação Zod da resposta LLM antes de retornar ao cliente
- [x] Pré-preenchimento na reavaliação via `defaultValues` do RHF
- Resultado: [`research.md`](./research.md)

### Phase 1: Design ✅
- [x] Data model: [`data-model.md`](./data-model.md)
- [x] Contracts: [`contracts/score.yaml`](./contracts/score.yaml)
- [x] Quickstart: [`quickstart.md`](./quickstart.md)

### Phase 2: Task Breakdown → `/specforge.tasks`

### Phase 3: Implementation

#### 3.1 — Lib de Scoring (sem dependências externas)
1. `src/lib/scoring/formula.ts` — `calculateScore()` com inversão de Complexidade
2. `src/lib/scoring/levels.ts` — `getScoreLevel()`
3. `src/lib/scoring/origin.ts` — `determineScoredBy()`
4. `src/lib/scoring/schemas.ts` — todos os Zod schemas

#### 3.2 — LLM Adapters (server-side)
1. `src/lib/llm/types.ts` — interface `LLMAdapter`
2. `src/lib/llm/openai.ts` — `OpenAIAdapter` com `gpt-4o-mini` + `response_format: json_object`
3. `src/lib/llm/gemini.ts` — `GeminiAdapter` com `gemini-1.5-flash`
4. `src/lib/llm/index.ts` — `createLLMAdapter()` factory

#### 3.3 — API Routes
1. `src/app/api/trends/[id]/score/route.ts` — PATCH:
   - Valida `ScoreInputSchema`
   - Calcula `total` via `calculateScore()` (dupla verificação server-side)
   - `Trend.findByIdAndUpdate` com score completo
2. `src/app/api/trends/[id]/autoscore/route.ts` — POST:
   - `createLLMAdapter()` → null = 503
   - Busca trend pelo ID
   - Chama `adapter.suggestScore(title, summary)` com AbortController 10s
   - Valida com `LLMScoreResponseSchema`
   - Retorna sugestão (não salva)

#### 3.4 — Componentes UI
1. `src/components/scoring/CriteriaInput.tsx` — RadioGroup shadcn 1-5, label por valor, indicação invertida para Complexidade
2. `src/components/scoring/ScoreTotalDisplay.tsx` — score em tempo real + `ScoreBadge` de nível
3. `src/components/scoring/AutoScoreButton.tsx` — loading state, mensagem de erro inline
4. `src/components/scoring/ScoreOriginBadge.tsx` — "Avaliação manual" | "Avaliado por IA"
5. `src/components/scoring/ScoreForm.tsx` — orquestra tudo com `useForm`, `watch()`, `useMemo`, estado `llmSuggestion`

#### 3.5 — Testes
1. Unit: `calculateScore()` — todos os edge cases (valores extremos, inversão, null parcial)
2. Unit: `determineScoredBy()` — igual, diferente, null llmSuggestion
3. Unit: `getScoreLevel()` — todos os ranges
4. Integration: `PATCH /api/trends/[id]/score` — happy path, 404, 422
5. Integration: `POST /api/trends/[id]/autoscore` — sem LLM (503), timeout (504), LLM inválida (422)

---

## Dependências Entre Tasks

```
3.1 (formula + schemas) → 3.2 (LLM adapters) → 3.3 (API routes)
                        → 3.4 (UI components)
3.3 + 3.4 → 3.5 (tests)
```

---

## Riscos e Mitigações

| Risco | Probabilidade | Mitigação |
|---|---|---|
| LLM retorna JSON mal formatado | Média | Zod parse com `safeParse`; erro 422 com mensagem orientadora |
| Timeout da LLM > 10s | Baixa-média | `AbortController` server-side; mensagem clara ao cliente |
| Analista confunde escala invertida | Média | Label explícito por valor no `CriteriaInput` ("5 = muito complexa") |
| Score total calculado client ≠ server | Muito baixa | Mesma função `calculateScore()` usada em ambos; dupla verificação |
| OpenAI/Gemini retorna float não-inteiro | Baixa | Schema Zod com `z.number().int()` rejeita e retorna 422 |

---

## Critérios de Conclusão da Feature

- [ ] SC-001: Score atualiza em < 200ms após alteração de critério
- [ ] SC-002: Fórmula produz resultado correto para casos de teste conhecidos
- [ ] SC-003: 100% dos scores registrados têm origem explícita
- [ ] SC-004: Formulário incompleto bloqueia salvamento em 100% das tentativas
- [ ] SC-005: Auto-score preenche formulário sem salvar automaticamente
- [ ] SC-006: Score ajustado após sugestão da IA sempre registra `scoredBy: "manual"`
