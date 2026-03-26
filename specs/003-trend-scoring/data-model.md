# Data Model: Trend Scoring

**Feature**: `003-trend-scoring`
**Branch**: `001-trend-collection`
**Date**: 2026-03-25
**Depends on**: `001-trend-collection` (subdocumento `score` em `ITrend`)

---

## Subdocumento `score` em `Trend` (sem alteração de schema)

O subdocumento já foi definido na feature 001. Listado aqui como referência de leitura:

```typescript
score?: {
  maturity:           number   // 1-5
  applicability:      number   // 1-5
  competitiveImpact:  number   // 1-5
  strategicAlignment: number   // 1-5
  adoptionComplexity: number   // 1-5 (armazenado direto; inversão na fórmula)
  total:              number   // calculado: resultado arredondado a 2 casas
  scoredBy:           'manual' | 'llm'
  scoredAt:           Date
  notes?:             string
}
```

**Nenhuma alteração de schema nesta feature** — o modelo já suporta todos os campos necessários.

---

## Fórmula de Score (fonte única de verdade)

```typescript
// src/lib/scoring/formula.ts

export interface ScoreCriteria {
  maturity:           number
  applicability:      number
  competitiveImpact:  number
  strategicAlignment: number
  adoptionComplexity: number   // 5=muito complexa; inversão aplicada aqui
}

export function calculateScore(criteria: Partial<ScoreCriteria>): number | null {
  const { maturity, applicability, competitiveImpact, strategicAlignment, adoptionComplexity } = criteria

  if (
    maturity           == null ||
    applicability      == null ||
    competitiveImpact  == null ||
    strategicAlignment == null ||
    adoptionComplexity == null
  ) return null

  const total =
    maturity           * 0.20 +
    applicability      * 0.30 +
    competitiveImpact  * 0.25 +
    strategicAlignment * 0.15 +
    (6 - adoptionComplexity) * 0.10   // inversão: 5=pior → contribui 0.1×1=0.1

  return Math.round(total * 100) / 100
}

// Exemplos de verificação:
// Todos 5 (exceto complexidade=5 invertido):
//   5×0.20 + 5×0.30 + 5×0.25 + 5×0.15 + (6-5)×0.10 = 1+1.5+1.25+0.75+0.1 = 4.60
// Todos 1 (exceto complexidade=1 invertido):
//   1×0.20 + 1×0.30 + 1×0.25 + 1×0.15 + (6-1)×0.10 = 0.2+0.3+0.25+0.15+0.5 = 1.40
// Máximo real (complexidade=1 = simples = melhor):
//   5×0.20 + 5×0.30 + 5×0.25 + 5×0.15 + (6-1)×0.10 = 1+1.5+1.25+0.75+0.5 = 5.00
// Mínimo real (complexidade=5 = muito complexa):
//   1×0.20 + 1×0.30 + 1×0.25 + 1×0.15 + (6-5)×0.10 = 0.2+0.3+0.25+0.15+0.1 = 1.00
```

**Nota**: Range real é [1.00, 5.00] — consistente com NFR-003.

---

## Zod Schemas de Validação

```typescript
// src/lib/scoring/schemas.ts

import { z } from 'zod'

const criteriaField = z.number().int().min(1).max(5)

export const ScoreInputSchema = z.object({
  maturity:           criteriaField,
  applicability:      criteriaField,
  competitiveImpact:  criteriaField,
  strategicAlignment: criteriaField,
  adoptionComplexity: criteriaField,
  notes:              z.string().max(2000).optional(),
  scoredBy:           z.enum(['manual', 'llm']),
})

export type ScoreInput = z.infer<typeof ScoreInputSchema>

// Schema de formulário no cliente (sem scoredBy — determinado no submit)
export const ScoreFormSchema = z.object({
  maturity:           criteriaField,
  applicability:      criteriaField,
  competitiveImpact:  criteriaField,
  strategicAlignment: criteriaField,
  adoptionComplexity: criteriaField,
  notes:              z.string().max(2000).default(''),
})

export type ScoreFormValues = z.infer<typeof ScoreFormSchema>

// Schema de validação da resposta LLM
export const LLMScoreResponseSchema = z.object({
  maturity:           criteriaField,
  applicability:      criteriaField,
  competitiveImpact:  criteriaField,
  strategicAlignment: criteriaField,
  adoptionComplexity: criteriaField,
})

export type LLMScoreResponse = z.infer<typeof LLMScoreResponseSchema>

// Resposta do endpoint PATCH /api/trends/[id]/score
export const ScoreResponseSchema = z.object({
  data: z.object({
    id:    z.string(),
    score: z.object({
      maturity:           criteriaField,
      applicability:      criteriaField,
      competitiveImpact:  criteriaField,
      strategicAlignment: criteriaField,
      adoptionComplexity: criteriaField,
      total:              z.number().min(1).max(5),
      scoredBy:           z.enum(['manual', 'llm']),
      scoredAt:           z.string(),
      notes:              z.string().optional(),
    }),
  }),
})
```

---

## LLM Adapter Interface

```typescript
// src/lib/llm/types.ts

export interface LLMAdapter {
  suggestScore(title: string, summary: string): Promise<LLMScoreResponse>
}

// src/lib/llm/index.ts — factory que seleciona o provider
export function createLLMAdapter(): LLMAdapter | null {
  const key      = process.env.LLM_API_KEY
  const provider = process.env.LLM_PROVIDER ?? 'openai'

  if (!key) return null

  if (provider === 'gemini') {
    const { GeminiAdapter } = require('./gemini')
    return new GeminiAdapter(key)
  }
  return (() => {
    const { OpenAIAdapter } = require('./openai')
    return new OpenAIAdapter(key)
  })()
}
```

---

## Lógica de Determinação de Origem

```typescript
// src/lib/scoring/origin.ts

import type { ScoreCriteria } from './formula'

export function determineScoredBy(
  submitted: ScoreCriteria,
  llmSuggestion: ScoreCriteria | null
): 'manual' | 'llm' {
  if (!llmSuggestion) return 'manual'

  const fields: (keyof ScoreCriteria)[] = [
    'maturity', 'applicability', 'competitiveImpact',
    'strategicAlignment', 'adoptionComplexity',
  ]

  return fields.every(f => submitted[f] === llmSuggestion[f]) ? 'llm' : 'manual'
}
```

---

## Níveis de Score (usado em UI — badge visual)

| Nível | Range | Cor sugerida |
|---|---|---|
| Baixo | 1.00 – 2.49 | `gray` |
| Médio | 2.50 – 3.49 | `amber` |
| Alto | 3.50 – 4.49 | `blue` |
| Crítico | 4.50 – 5.00 | `red` |

```typescript
// src/lib/scoring/levels.ts

export type ScoreLevel = 'baixo' | 'medio' | 'alto' | 'critico'

export function getScoreLevel(total: number): ScoreLevel {
  if (total < 2.50) return 'baixo'
  if (total < 3.50) return 'medio'
  if (total < 4.50) return 'alto'
  return 'critico'
}
```

---

## Diagrama de Fluxo de Dados

```
Formulário (Client Component)
  ├── watch() → calculateScore() → exibe total em tempo real
  ├── [Botão "Auto-score com IA"]
  │     ├── POST /api/trends/[id]/autoscore
  │     │     └── LLMAdapter.suggestScore(title, summary)
  │     │           └── Valida com LLMScoreResponseSchema (Zod)
  │     └── Preenche form via form.reset(suggestion)
  │           └── Armazena suggestion em llmSuggestion state
  └── [Botão "Salvar"]
        ├── determineScoredBy(submitted, llmSuggestion) → 'manual' | 'llm'
        ├── calculateScore(submitted) → total
        └── PATCH /api/trends/[id]/score
              ├── Valida com ScoreInputSchema (Zod)
              ├── Trend.findByIdAndUpdate({ score: { ...criteria, total, scoredBy, scoredAt } })
              └── Retorna ScoreResponse
```
