# Research: Trend Scoring

**Feature**: `003-trend-scoring`
**Branch**: `001-trend-collection`
**Date**: 2026-03-25

---

## 1. Cálculo de Score em Tempo Real no Cliente (NFR-001: < 200ms)

**Decision**: Função pura em `src/lib/scoring/formula.ts` chamada via `watch()` do React Hook Form + `useMemo`

**Pattern**:
```typescript
// src/lib/scoring/formula.ts — fonte única da verdade (constitution §VI)
export interface ScoreCriteria {
  maturity:           number  // 1-5
  applicability:      number  // 1-5
  competitiveImpact:  number  // 1-5
  strategicAlignment: number  // 1-5
  adoptionComplexity: number  // 1-5 (armazenado direto; peso aplicado normalmente)
}

export function calculateScore(criteria: Partial<ScoreCriteria>): number | null {
  const { maturity, applicability, competitiveImpact, strategicAlignment, adoptionComplexity } = criteria
  if ([maturity, applicability, competitiveImpact, strategicAlignment, adoptionComplexity].some(v => v == null)) {
    return null  // null = incompleto
  }
  const total =
    maturity!           * 0.20 +
    applicability!      * 0.30 +
    competitiveImpact!  * 0.25 +
    strategicAlignment! * 0.15 +
    adoptionComplexity! * 0.10
  return Math.round(total * 100) / 100  // 2 casas decimais
}
```

**No formulário React Hook Form**:
```typescript
const { watch, ... } = useForm<ScoreFormValues>()
const values = watch()
const totalScore = useMemo(() => calculateScore(values), [values])
```

**Por que useMemo**: `watch()` já retorna novo objeto referência a cada mudança — `useMemo` garante que `calculateScore` só é invocada quando os valores mudam (< 1ms para 5 operações de multiplicação/soma). NFR-001 garantido sem otimizações adicionais.

**Nota sobre Complexidade de Adoção**: A spec diz que o critério é "invertido" (5=muito complexa = pior). A constitution §VI diz: "o valor armazenado é o score direto — a inversão é aplicada na fórmula se necessário". Decisão: **aplicar a inversão na fórmula** (`(6 - adoptionComplexity) × 0.10`) para que o analista insira 5 representando "muito complexa" e a fórmula penalize isso. O campo de UI deve indicar claramente "5 = muito complexa (pior)".

---

## 2. Determinação de Origem: Manual vs. LLM (FR-011, FR-012)

**Decision**: Comparar valores atuais do formulário com os valores originais sugeridos pela LLM no momento do submit

**Pattern**:
```typescript
// Estado no componente de formulário
const [llmSuggestion, setLlmSuggestion] = useState<ScoreCriteria | null>(null)

function determineScoredBy(
  submitted: ScoreCriteria,
  original: ScoreCriteria | null
): 'manual' | 'llm' {
  if (!original) return 'manual'
  return (
    submitted.maturity           === original.maturity           &&
    submitted.applicability      === original.applicability      &&
    submitted.competitiveImpact  === original.competitiveImpact  &&
    submitted.strategicAlignment === original.strategicAlignment &&
    submitted.adoptionComplexity === original.adoptionComplexity
  ) ? 'llm' : 'manual'
}
```

`llmSuggestion` é definido quando o auto-score retorna. Se o analista altera qualquer valor, a comparação resultará em `'manual'`. Se salvar sem alterar, `'llm'`.

---

## 3. Integração LLM — Gemini e OpenAI

**Decision**: Adapter único com provider selecionável via `LLM_PROVIDER` env var; implementações separadas por provider

**Variáveis de ambiente**:
```
LLM_API_KEY=sk-...          (obrigatória para habilitar)
LLM_PROVIDER=openai         (openai | gemini; default: openai)
```

**Interface do adapter**:
```typescript
// src/lib/llm/types.ts
export interface LLMScoreResult {
  maturity:           number
  applicability:      number
  competitiveImpact:  number
  strategicAlignment: number
  adoptionComplexity: number
}

export interface LLMAdapter {
  suggestScore(title: string, summary: string): Promise<LLMScoreResult>
}
```

**Prompt padrão** (enviado a qualquer provider):
```
You are an AI research analyst. Score the following AI trend on 5 criteria, each from 1 to 5.

Title: {title}
Summary: {summary}

Criteria:
- maturity: Technological Maturity (1=research, 5=production-ready)
- applicability: Immediate Applicability (1=none, 5=direct)
- competitiveImpact: Competitive Impact (1=incremental, 5=disruptive)
- strategicAlignment: Strategic Alignment (1=low, 5=high)
- adoptionComplexity: Adoption Complexity (1=simple, 5=very complex)

Return ONLY a JSON object with integer values 1-5 for each criterion. No explanation.
Example: {"maturity":3,"applicability":4,"competitiveImpact":5,"strategicAlignment":3,"adoptionComplexity":2}
```

**OpenAI** (`gpt-4o-mini` — menor custo, suficiente para scoring):
```typescript
import OpenAI from 'openai'
const client = new OpenAI({ apiKey: process.env.LLM_API_KEY })
const response = await client.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [{ role: 'user', content: prompt }],
  response_format: { type: 'json_object' },
  max_tokens: 100,
})
```

**Gemini** (`gemini-1.5-flash` — tier gratuito generoso):
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai'
const genAI = new GoogleGenerativeAI(process.env.LLM_API_KEY!)
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
const result = await model.generateContent(prompt)
const text = result.response.text()
```

**Dependências**:
- OpenAI: `npm install openai`
- Gemini: `npm install @google/generative-ai`

Instalar ambas — a ativa é selecionada pelo env var em runtime.

---

## 4. Timeout de 10 segundos para LLM (NFR-002)

**Decision**: `AbortController` com `setTimeout` de 10s no fetch do lado do servidor; estado de loading/error no cliente

**Server-side** (route handler `/api/trends/[id]/autoscore`):
```typescript
const controller = new AbortController()
const timer = setTimeout(() => controller.abort(), 10_000)
try {
  const result = await llmAdapter.suggestScore(title, summary)
  return Response.json({ data: result })
} catch (err) {
  if (err instanceof Error && err.name === 'AbortError') {
    return Response.json({ error: { code: 'LLM_TIMEOUT', message: 'Auto-score timed out after 10s' } }, { status: 504 })
  }
  throw err
} finally {
  clearTimeout(timer)
}
```

**Client-side**: Estado `isLoadingAutoScore` + mensagem de erro inline se timeout/falha.

---

## 5. Validação de Resposta da LLM (Edge Case: valor fora de 1-5)

**Decision**: Validar resposta da LLM com Zod antes de retornar ao cliente

```typescript
const LLMResponseSchema = z.object({
  maturity:           z.number().int().min(1).max(5),
  applicability:      z.number().int().min(1).max(5),
  competitiveImpact:  z.number().int().min(1).max(5),
  strategicAlignment: z.number().int().min(1).max(5),
  adoptionComplexity: z.number().int().min(1).max(5),
})
```

Se a LLM retornar valor inválido (ex: `6`, `0`, ou não-inteiro), retornar erro 422 ao cliente com mensagem "A IA retornou valores inválidos — por favor avalie manualmente".

---

## 6. Formulário com React Hook Form + Zod

**Decision**: `useForm` com `zodResolver`, validação síncrona, `watch()` para cálculo em tempo real

```typescript
const ScoreFormSchema = z.object({
  maturity:           z.number().int().min(1).max(5),
  applicability:      z.number().int().min(1).max(5),
  competitiveImpact:  z.number().int().min(1).max(5),
  strategicAlignment: z.number().int().min(1).max(5),
  adoptionComplexity: z.number().int().min(1).max(5),
  notes:              z.string().max(2000).optional(),
})

type ScoreFormValues = z.infer<typeof ScoreFormSchema>
```

**Controle de UI**: Slider (1-5) ou RadioGroup com 5 opções — shadcn/ui `Slider` ou `RadioGroup`. RadioGroup é mais explícito para valores 1-5 com labels.

---

## 7. Pré-preenchimento na Reavaliação (FR-013)

**Decision**: Carregar score atual como `defaultValues` do `useForm`

```typescript
const { data: trend } = useTrend(id)  // ou via props do Server Component

const form = useForm<ScoreFormValues>({
  resolver: zodResolver(ScoreFormSchema),
  defaultValues: trend?.score
    ? {
        maturity:           trend.score.maturity,
        applicability:      trend.score.applicability,
        competitiveImpact:  trend.score.competitiveImpact,
        strategicAlignment: trend.score.strategicAlignment,
        adoptionComplexity: trend.score.adoptionComplexity,
        notes:              trend.score.notes ?? '',
      }
    : undefined,
})
```

A reavaliação sobrescreve o score existente (upsert no banco).

---

## 8. Endpoint de Auto-score: Server vs. Client-side LLM Call

**Decision**: Chamada à LLM feita **no servidor** (API Route `/api/trends/[id]/autoscore`)

**Rationale**:
- `LLM_API_KEY` é variável server-side — nunca exposta ao cliente (constitution §VII)
- Timeout e validação da resposta ficam centralizados
- O cliente só faz `POST /api/trends/[id]/autoscore` e recebe os valores sugeridos
