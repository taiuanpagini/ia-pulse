# Quickstart: Trend Scoring

**Feature**: `003-trend-scoring`
**Depends on**: `001-trend-collection` (Trend com campo `score`), `002-topic-management` (listagem)

---

## Pré-requisitos

- Features 001 e 002 implementadas
- MongoDB conectado com ao menos uma tendência coletada

---

## 1. Salvar Score Manualmente

```bash
curl -X PATCH http://localhost:3000/api/trends/<TREND_ID>/score \
  -H "Content-Type: application/json" \
  -d '{
    "maturity": 4,
    "applicability": 5,
    "competitiveImpact": 4,
    "strategicAlignment": 3,
    "adoptionComplexity": 2,
    "notes": "Alta aplicabilidade imediata. Complexidade baixa.",
    "scoredBy": "manual"
  }'
```

Resposta esperada:
```json
{
  "data": {
    "id": "660d1a2b3c4e5f6a7b8c9d10",
    "score": {
      "maturity": 4,
      "applicability": 5,
      "competitiveImpact": 4,
      "strategicAlignment": 3,
      "adoptionComplexity": 2,
      "total": 4.20,
      "scoredBy": "manual",
      "scoredAt": "2026-03-25T10:30:00.000Z",
      "notes": "Alta aplicabilidade imediata. Complexidade baixa."
    }
  }
}
```

**Verificando a fórmula**:
```
4×0.20 + 5×0.30 + 4×0.25 + 3×0.15 + (6-2)×0.10
= 0.80 + 1.50 + 1.00 + 0.45 + 0.40
= 4.15
```

---

## 2. Configurar LLM para Auto-score

Adicionar ao `.env.local`:

```env
# OpenAI
LLM_API_KEY=sk-...
LLM_PROVIDER=openai

# OU Gemini
LLM_API_KEY=AI...
LLM_PROVIDER=gemini
```

Instalar o SDK correspondente:

```bash
# OpenAI
npm install openai

# Gemini
npm install @google/generative-ai
```

---

## 3. Solicitar Auto-score via LLM

```bash
curl -X POST http://localhost:3000/api/trends/<TREND_ID>/autoscore
```

Resposta esperada:
```json
{
  "data": {
    "maturity": 3,
    "applicability": 4,
    "competitiveImpact": 5,
    "strategicAlignment": 4,
    "adoptionComplexity": 3
  }
}
```

O cliente usa esses valores para pré-preencher o formulário. O analista revisa e então chama `PATCH /score`.

---

## 4. Verificar Fórmula Isoladamente

```typescript
import { calculateScore } from '@/lib/scoring/formula'

// Todos os critérios máximos + complexidade mínima (= melhor cenário)
calculateScore({ maturity: 5, applicability: 5, competitiveImpact: 5, strategicAlignment: 5, adoptionComplexity: 1 })
// → 5.00

// Todos mínimos + complexidade máxima (= pior cenário)
calculateScore({ maturity: 1, applicability: 1, competitiveImpact: 1, strategicAlignment: 1, adoptionComplexity: 5 })
// → 1.00

// Incompleto
calculateScore({ maturity: 3, applicability: 4 })
// → null
```

---

## 5. Verificar Nível do Score

```typescript
import { getScoreLevel } from '@/lib/scoring/levels'

getScoreLevel(4.60)  // → 'critico'
getScoreLevel(3.80)  // → 'alto'
getScoreLevel(2.90)  // → 'medio'
getScoreLevel(1.50)  // → 'baixo'
```

---

## 6. Comportamento do Formulário (Client Component)

O formulário de scoring é um Client Component com o seguinte comportamento:

| Ação | Resultado |
|---|---|
| Alterar qualquer critério | Score total atualiza em tempo real (< 200ms) |
| Todos os 5 critérios preenchidos | Botão "Salvar" habilitado |
| Critério faltando | Botão "Salvar" desabilitado |
| Clicar "Auto-score com IA" | Formulário preenchido com sugestão (não salva) |
| Salvar sem modificar sugestão da IA | `scoredBy: "llm"` |
| Salvar após modificar ao menos 1 valor | `scoredBy: "manual"` |
| Abrir formulário de tendência já avaliada | Campos pré-preenchidos com score atual |

---

## 7. Casos Extremos a Testar

```bash
# Critério com valor inválido (deve retornar 422)
curl -X PATCH http://localhost:3000/api/trends/<ID>/score \
  -H "Content-Type: application/json" \
  -d '{"maturity":6,"applicability":3,"competitiveImpact":4,"strategicAlignment":3,"adoptionComplexity":2,"scoredBy":"manual"}'

# Sem LLM configurado (deve retornar 503)
curl -X POST http://localhost:3000/api/trends/<ID>/autoscore

# Trend ID inexistente (deve retornar 404)
curl -X PATCH http://localhost:3000/api/trends/000000000000000000000000/score \
  -H "Content-Type: application/json" \
  -d '{"maturity":3,"applicability":3,"competitiveImpact":3,"strategicAlignment":3,"adoptionComplexity":3,"scoredBy":"manual"}'
```

---

## Estrutura de Arquivos Relevante

```
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
      formula.ts              ← calculateScore() — fonte única de verdade
      levels.ts               ← getScoreLevel()
      origin.ts               ← determineScoredBy()
      schemas.ts              ← ScoreInputSchema, ScoreFormSchema, LLMScoreResponseSchema
    llm/
      types.ts                ← interface LLMAdapter
      index.ts                ← createLLMAdapter() factory
      openai.ts               ← OpenAIAdapter
      gemini.ts               ← GeminiAdapter
  components/
    scoring/
      ScoreForm.tsx           ← "use client" — formulário completo com React Hook Form
      ScoreDisplay.tsx        ← exibição readonly do score (detalhe + listagem)
      CriteriaSlider.tsx      ← input de critério individual (1-5)
      AutoScoreButton.tsx     ← botão com loading state
```
