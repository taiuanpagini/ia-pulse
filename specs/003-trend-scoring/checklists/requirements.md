# Requirements Checklist: Trend Scoring

**Feature Branch**: `001-trend-collection`
**Feature Directory**: `specs/003-trend-scoring`
**Spec**: `spec.md`
**Validated**: 2026-03-25

---

## Spec Quality Validation

| # | Check | Status | Notes |
|---|---|---|---|
| 1 | User stories seguem formato As a / I want / So that | PASS | Todas as 4 histórias seguem o formato |
| 2 | User stories focadas em valor de negócio, sem detalhes de implementação | PASS | Nenhuma menção a framework, banco ou protocolo |
| 3 | Cenários de aceitação escritos em Gherkin | PASS | Todos os cenários usam Gherkin consistentemente |
| 4 | Requisitos funcionais são testáveis e não ambíguos | PASS | Cada FR descreve comportamento verificável |
| 5 | Critérios de sucesso são mensuráveis e agnósticos de tecnologia | PASS | SC-001 a SC-006 com métricas concretas |
| 6 | Edge cases identificados | PASS | 6 edge cases documentados |
| 7 | NFRs definidos com thresholds mensuráveis | PASS | NFR-001 (200ms), NFR-002 (10s timeout), NFR-003 (intervalo 1,00–5,00) |
| 8 | Cada user story tem ao menos 3 cenários de teste | PASS | US01: 3, US02: 4, US03: 4, US04: 3 |
| 9 | Cada edge case tem cenário de teste correspondente | PASS | TS-EC-001 a TS-EC-006 |
| 10 | Cada NFR mensurável tem cenário de teste correspondente | PASS | TS-NFR-001, TS-NFR-002 |
| 11 | Todos os FRs rastreados a ao menos um cenário de teste | PASS | Ver matriz abaixo |
| 12 | Máximo 3 marcadores [NEEDS CLARIFICATION] | PASS | Nenhum marcador necessário |

---

## Rastreabilidade: FR → Test Scenarios

| Requisito | Cenários que cobrem |
|---|---|
| FR-001 (5 critérios com pesos) | TS-US01-001, TS-US02-004 |
| FR-002 (Valores inteiros 1-5) | TS-US01-001, TS-EC-004, TS-EC-005 |
| FR-003 (Complexidade invertida identificada) | TS-US02-002 |
| FR-004 (Fórmula ponderada) | TS-US01-001, TS-US02-001, TS-US02-002, TS-US02-004, TS-EC-004, TS-EC-005 |
| FR-005 (Score em tempo real) | TS-US02-001, TS-US02-003 |
| FR-006 (Campo de notas opcional) | TS-US01-002 |
| FR-007 (Bloquear salvamento incompleto) | TS-US01-003, TS-US02-003, TS-EC-003 |
| FR-008 (Registrar origem manual/llm) | TS-US01-001, TS-US03-002, TS-US03-003 |
| FR-009 (Botão IA apenas com config) | TS-US03-001, TS-US03-004 |
| FR-010 (Auto-score não salva automaticamente) | TS-US03-001, TS-EC-001, TS-EC-002 |
| FR-011 (Ajuste pós-IA → origem manual) | TS-US03-002 |
| FR-012 (Sem ajuste pós-IA → origem llm) | TS-US03-003 |
| FR-013 (Reavaliação pré-carrega score atual) | TS-US04-003 |
| FR-014 (Origem visível no detalhe) | TS-US04-001, TS-US04-002 |

---

## Rastreabilidade: NFR → Test Scenarios

| Requisito | Cenários que cobrem |
|---|---|
| NFR-001 (Score < 200ms) | TS-US02-001, TS-NFR-001 |
| NFR-002 (LLM timeout 10s) | TS-EC-002, TS-EC-006, TS-NFR-002 (implícito) |
| NFR-003 (Score entre 1,00 e 5,00) | TS-EC-004, TS-EC-005, TS-NFR-002 |

---

## Resultado

**Status geral**: APROVADO — spec pronta para `/specforge.plan`

Todos os 14 FRs e 3 NFRs cobertos por ao menos um cenário de teste. Nenhuma ambiguidade crítica. Nenhum marcador [NEEDS CLARIFICATION] necessário. Atenção especial à lógica de detecção de modificação pós-auto-score (FR-011 vs FR-012) — requer rastreamento de estado "valores originais da IA" vs "valores atuais do formulário" durante a implementação.
