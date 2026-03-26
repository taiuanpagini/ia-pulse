# Requirements Checklist: Trend Collection

**Feature Branch**: `001-trend-collection`
**Spec**: `spec.md`
**Validated**: 2026-03-25

---

## Spec Quality Validation

| # | Check | Status | Notes |
|---|---|---|---|
| 1 | User stories seguem formato As a / I want / So that | PASS | Todas as 4 histórias seguem o formato |
| 2 | User stories focadas em valor de negócio, sem detalhes de implementação | PASS | Nenhuma menção a framework, API, banco ou protocolo |
| 3 | Cenários de aceitação escritos em Gherkin (Scenario / Given / When / Then) | PASS | Todos os cenários usam Gherkin consistentemente |
| 4 | Requisitos funcionais são testáveis e não ambíguos | PASS | Cada FR descreve comportamento verificável |
| 5 | Critérios de sucesso são mensuráveis e agnósticos de tecnologia | PASS | SC-001 a SC-006 com métricas concretas |
| 6 | Edge cases identificados | PASS | 4 edge cases documentados |
| 7 | NFRs definidos com thresholds mensuráveis | PASS | NFR-001 (10min), NFR-002 (80%), NFR-003 (HTTP 401), NFR-004, NFR-005 (2s) |
| 8 | Cada user story tem ao menos 3 cenários de teste (happy, alternative, error) | PASS | US01: 4, US02: 3, US03: 3, US04: 3 |
| 9 | Cada edge case tem cenário de teste correspondente | PASS | TS-EC-001 a TS-EC-004 |
| 10 | Cada NFR mensurável tem cenário de teste correspondente | PASS | TS-NFR-001, TS-US04-003 |
| 11 | Todos os FRs rastreados a ao menos um cenário de teste | PASS | Ver matriz abaixo |
| 12 | Máximo 3 marcadores [NEEDS CLARIFICATION] | PASS | Nenhum marcador necessário |

---

## Rastreabilidade: FR → Test Scenarios

| Requisito | Cenários que cobrem |
|---|---|
| FR-001 (arXiv) | TS-US01-001, TS-US01-004, TS-EC-002 |
| FR-002 (HackerNews) | TS-US01-001, TS-EC-002 |
| FR-003 (Reddit) | TS-US01-001, TS-EC-002 |
| FR-004 (Semantic Scholar) | TS-US01-001, TS-EC-002 |
| FR-005 (Papers With Code) | TS-US01-001, TS-EC-002 |
| FR-006 (RSS feeds) | TS-US01-001, TS-US01-004, TS-EC-002 |
| FR-007 (Associação a tópico) | TS-US01-004 |
| FR-008 (Deduplicação por URL) | TS-US03-001, TS-US03-002, TS-US03-003 |
| FR-009 (Schedule diário 07:00 UTC) | TS-US01-001 |
| FR-010 (Proteção por credencial) | TS-US01-002, TS-US01-003 |
| FR-011 (Isolamento de falhas) | TS-US02-001, TS-US02-003, TS-EC-001, TS-EC-003 |
| FR-012 (Log por fonte) | TS-US02-001, TS-US02-002, TS-US02-003, TS-EC-001, TS-EC-002, TS-EC-003, TS-EC-004 |
| FR-013 (Health endpoint) | TS-US04-001, TS-US04-002, TS-US04-003 |
| FR-014 (RSS configurável por arquivo) | Validar manualmente ao adicionar novo tema — sem cenário automatizável específico |

---

## Rastreabilidade: NFR → Test Scenarios

| Requisito | Cenários que cobrem |
|---|---|
| NFR-001 (Coleta < 10min) | TS-NFR-001 |
| NFR-002 (80% fontes com sucesso) | TS-US02-003 |
| NFR-003 (HTTP 401 sem credencial) | TS-US01-003 |
| NFR-004 (Log estruturado por fonte) | TS-US02-002, TS-EC-002, TS-EC-004 |
| NFR-005 (Health < 2s) | TS-US04-003 |

---

## Resultado

**Status geral**: APROVADO — spec pronta para `/specforge.plan`

Todos os requisitos estão cobertos por ao menos um cenário de teste. Nenhuma ambiguidade crítica identificada. Nenhum marcador [NEEDS CLARIFICATION] necessário.
