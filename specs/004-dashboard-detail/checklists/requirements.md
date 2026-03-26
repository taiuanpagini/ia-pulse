# Requirements Checklist: Dashboard & Trend Detail

**Feature Branch**: `001-trend-collection`
**Feature Directory**: `specs/004-dashboard-detail`
**Spec**: `spec.md`
**Validated**: 2026-03-25

---

## Spec Quality Validation

| # | Check | Status | Notes |
|---|---|---|---|
| 1 | User stories seguem formato As a / I want / So that | PASS | Todas as 5 histórias seguem o formato |
| 2 | User stories focadas em valor de negócio, sem detalhes de implementação | PASS | Nenhuma menção a framework, banco ou protocolo |
| 3 | Cenários de aceitação escritos em Gherkin | PASS | Todos os cenários usam Gherkin consistentemente |
| 4 | Requisitos funcionais são testáveis e não ambíguos | PASS | Cada FR descreve comportamento verificável; faixas de badge definidas explicitamente em FR-003 |
| 5 | Critérios de sucesso são mensuráveis e agnósticos de tecnologia | PASS | SC-001 a SC-006 com métricas concretas |
| 6 | Edge cases identificados | PASS | 4 edge cases documentados |
| 7 | NFRs definidos com thresholds mensuráveis | PASS | NFR-001 e NFR-002 (2s), NFR-003 (consistência de cores), NFR-004 (responsividade) |
| 8 | Cada user story tem ao menos 3 cenários de teste | PASS | US01: 3, US02: 3, US03: 3, US04: 3, US05: 3 |
| 9 | Cada edge case tem cenário de teste correspondente | PASS | TS-EC-001 a TS-EC-004 |
| 10 | Cada NFR mensurável tem cenário de teste correspondente | PASS | TS-NFR-001, TS-NFR-002; NFR-003 coberto por TS-US01-003 |
| 11 | Todos os FRs rastreados a ao menos um cenário de teste | PASS | Ver matriz abaixo |
| 12 | Máximo 3 marcadores [NEEDS CLARIFICATION] | PASS | Nenhum marcador necessário |

---

## Rastreabilidade: FR → Test Scenarios

| Requisito | Cenários que cobrem |
|---|---|
| FR-001 (Ranking por score decrescente) | TS-US01-001, TS-EC-001, TS-EC-002 |
| FR-002 (Campos obrigatórios no card) | TS-US01-001, TS-US01-003 |
| FR-003 (Faixas de badge de nível) | TS-US01-002 |
| FR-004 (Seção "Aguardando avaliação") | TS-US02-001, TS-US02-002, TS-EC-001, TS-EC-002 |
| FR-005 (Sem score fora do ranking) | TS-US02-001, TS-EC-002 |
| FR-006 (Filtro por tópico — ranking e backlog) | TS-US03-001, TS-US03-002, TS-US03-003 |
| FR-007 (Migração backlog → ranking após avaliação) | TS-US02-003, TS-US05-002 |
| FR-008 (Campos obrigatórios no detalhe) | TS-US04-001, TS-US04-002, TS-EC-004 |
| FR-009 (Formulário inline no detalhe) | TS-US05-001 |
| FR-010 (Pré-preenchimento para reavaliação) | TS-US04-003 |
| FR-011 (Score/badge/origem visíveis no detalhe avaliado) | TS-US04-003 |
| FR-012 (Botão IA no detalhe) | TS-US05-003 |
| FR-013 (Score exibido após salvar sem recarregar) | TS-US05-002 |
| FR-014 (404 para ID inexistente) | TS-EC-003 |

---

## Rastreabilidade: NFR → Test Scenarios

| Requisito | Cenários que cobrem |
|---|---|
| NFR-001 (Dashboard < 2s) | TS-NFR-001 |
| NFR-002 (Detalhe < 2s) | TS-NFR-002 |
| NFR-003 (Cores consistentes por tópico) | TS-US01-003 |
| NFR-004 (Responsividade desktop/tablet) | Não coberto por cenário específico — validar manualmente durante implementação |

---

## Notas de Implementação

- **Integração com 003-trend-scoring**: US05 desta feature depende diretamente do comportamento especificado em `003-trend-scoring`. O formulário inline é o mesmo componente — a spec de comportamento de scoring (critérios, fórmula, auto-score, origem) é autoritativa na feature 003.
- **FR-013 (score após salvar)**: requer que a página de detalhe atualize o estado local após o salvamento sem recarregar a URL — comportamento de UI a ser considerado na implementação.
- **NFR-004**: responsividade não foi coberta por cenário de teste automatizável — recomenda-se validação manual em dispositivos reais ou emulação.

---

## Resultado

**Status geral**: APROVADO — spec pronta para `/specforge.plan`

Todos os 14 FRs cobertos por ao menos um cenário de teste. NFR-004 (responsividade) marcado para validação manual. Nenhuma ambiguidade crítica. Nenhum marcador [NEEDS CLARIFICATION] necessário.
