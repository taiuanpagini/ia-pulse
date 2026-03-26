# Quickstart: Dashboard & Trend Detail

**Feature**: `004-dashboard-detail`
**Depends on**: `001` (Trend + coleta), `002` (Topic + listagem), `003` (scoring + LLM)

---

## Pré-requisitos

- Features 001–003 implementadas
- MongoDB com dados coletados (`/api/cron/collect` executado ao menos uma vez)
- Seed de tópicos executado

---

## 1. Acessar o Dashboard

Abrir `http://localhost:3000/`

O dashboard exibe:
- **Ranking** — tendências avaliadas, da maior para a menor pontuação
- **Aguardando avaliação** — tendências coletadas sem score, da mais recente para a mais antiga

---

## 2. Filtrar por Tópico

```
http://localhost:3000/?topic=infraestrutura
http://localhost:3000/?topic=regulamentacao
http://localhost:3000/?topic=geral
```

O filtro afeta ambas as seções simultaneamente. Remover o parâmetro restaura a visão completa.

---

## 3. Acessar Detalhe de uma Tendência

```
http://localhost:3000/trends/<TREND_ID>
```

A página de detalhe exibe:
- Conteúdo completo da tendência
- Link para a fonte original (abre em nova aba)
- Score atual + badge de nível + origem (se já avaliada)
- Formulário de scoring inline (pré-preenchido se já avaliada)

---

## 4. Verificar Detalhe via API

```bash
curl http://localhost:3000/api/trends/<TREND_ID>
```

Resposta para tendência já avaliada:
```json
{
  "data": {
    "id": "660d1a2b3c4e5f6a7b8c9d10",
    "title": "FlashAttention-3: Fast and Accurate Attention",
    "summary": "We present FlashAttention-3...",
    "url": "https://arxiv.org/abs/2407.08608",
    "source": "arXiv",
    "topicSlug": "infraestrutura",
    "topicName": "Infraestrutura",
    "topicColor": "blue",
    "collectedAt": "2026-03-25T07:00:00.000Z",
    "score": {
      "maturity": 4,
      "applicability": 5,
      "competitiveImpact": 4,
      "strategicAlignment": 3,
      "adoptionComplexity": 2,
      "total": 4.15,
      "level": "alto",
      "scoredBy": "manual",
      "scoredAt": "2026-03-25T10:30:00.000Z",
      "notes": "Impacto imediato para workloads de inference."
    }
  }
}
```

---

## 5. Fluxo Completo de Avaliação pelo Dashboard

```
1. Acessar dashboard: http://localhost:3000/
2. Clicar em uma tendência na seção "Aguardando avaliação"
3. Na página de detalhe: ler título e resumo
4. Preencher os 5 critérios no formulário inline
5. [Opcional] clicar "Auto-score com IA" para sugestão
6. Ajustar valores se necessário
7. Adicionar notas (opcional)
8. Clicar "Salvar avaliação"
9. → Score aparece imediatamente na página (sem reload)
10. → Voltar ao dashboard: tendência migrou para o ranking
```

---

## 6. Testar Estado Vazio do Dashboard

Para ver o estado vazio (sem tendências):
```bash
# Conectar ao MongoDB e esvaziar a collection (apenas para testes locais)
use iapulse
db.trends.deleteMany({})
```

Acessar `http://localhost:3000/` deve exibir mensagem orientadora.

---

## 7. Testar Página 404

```
http://localhost:3000/trends/000000000000000000000000
```

Deve exibir página de "Tendência não encontrada" com link de retorno ao dashboard.

---

## 8. Comportamentos Visuais a Verificar

| Comportamento | Como verificar |
|---|---|
| Badge de nível correto | Criar tendências com scores 1.5, 2.8, 3.9, 4.8 → badges Baixo/Médio/Alto/Crítico |
| Cor de tópico consistente | Mesma cor no card do dashboard e na página de detalhe |
| Migração após scoring | Avaliar tendência → voltar ao dashboard → não mais em "Aguardando" |
| Score em tempo real | Alterar critérios no formulário → score atualiza sem delay |
| Link em nova aba | Clicar "Ver fonte original" → abre em nova aba, sem fechar o sistema |
| 404 com ID inválido | `/trends/abc123` → página de não encontrado |

---

## Estrutura de Arquivos Relevante

```
src/
  app/
    page.tsx                         ← Dashboard (Server Component)
    trends/
      [id]/
        page.tsx                     ← Detalhe (Server Component)
        not-found.tsx                ← 404 customizado
    api/
      trends/
        [id]/
          route.ts                   ← GET /api/trends/[id]
          score/route.ts             ← PATCH (de 003)
          autoscore/route.ts         ← POST (de 003)
  lib/
    trends/
      service.ts                     ← getDashboardData(), getTrendDetail()
      repository.ts                  ← getScoredTrends(), getUnscoredTrends(), getTrendById()
  components/
    dashboard/
      TrendCard.tsx                  ← card do ranking (Server Component)
      RankedSection.tsx              ← seção de avaliadas com estado vazio
      AwaitingSection.tsx            ← seção backlog com estado vazio
      TopicFilterBar.tsx             ← "use client" — seletor de tópico
    trend/
      TrendDetailHeader.tsx          ← conteúdo completo + link fonte
      ScoreDisplay.tsx               ← score atual + origem + notas (readonly)
    ui/
      TopicBadge.tsx                 ← de 002 (reutilizado)
      ScoreBadge.tsx                 ← de 003 (reutilizado)
      ScoreOriginBadge.tsx           ← de 003 (reutilizado)
    scoring/
      ScoreForm.tsx                  ← de 003 (reutilizado aqui inline)
```
