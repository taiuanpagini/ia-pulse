# Implementation Plan: Topic Management

**Branch**: `001-trend-collection` | **Date**: 2026-03-25 | **Spec**: [spec.md](./spec.md)
**Depends on**: `001-trend-collection` (models Trend e Topic, seed)

## Summary

Implementar o gerenciamento de tópicos de monitoramento (CRUD com slug imutável e cor auto-atribuída) e a listagem de tendências filtrável por tópico, fonte e período, com paginação e indicação visual de score. O campo `color` é adicionado ao model `Topic` para garantir consistência visual de tags em todas as páginas (NFR-004). Os filtros são driven por query params do App Router, resolvidos no Server Component sem estado de cliente.

---

## Technical Context

| Item | Decisão |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Banco** | MongoDB Atlas via Mongoose |
| **Filtros** | Query params + Server Component (`searchParams`) |
| **Paginação** | Offset-based: `?page=1&limit=20` |
| **Cores de tags** | Paleta Tailwind armazenada em `Topic.color`, auto-atribuída |
| **Período** | Presets: `1d`, `7d`, `30d`, `90d` |
| **Slug** | Gerado do `name`; imutável (`immutable: true` no Mongoose) |
| **UI** | shadcn/ui + Tailwind CSS |
| **Validação** | Zod |

---

## Constitution Check

- [x] TypeScript strict mode — todos os schemas e services tipados
- [x] Schemas Zod para todos os inputs de API (`CreateTopicSchema`, `UpdateTopicSchema`, `TrendFiltersSchema`)
- [x] Model Mongoose com interface TypeScript (`ITopic` com campo `color`)
- [x] Layered architecture: `route.ts` → `service.ts` → `repository.ts`
- [x] Try/catch em todas as API Routes com erro estruturado `{ error: { code, message } }`
- [x] Paginação offset-based conforme constitution §III
- [x] `slug` imutável via `immutable: true` no schema (NFR-003)
- [x] Server Components por padrão; `"use client"` apenas em `TrendFilters.tsx`
- [x] shadcn/ui como biblioteca primária de UI
- [x] React Hook Form + Zod para formulário de criação/edição de tópico
- [x] Todos os estados de loading, erro e vazio tratados com padrões shadcn
- [x] `TopicBadge` como componente único de renderização de cor de tag (NFR-004)

---

## Project Structure

```
specs/002-topic-management/
├── plan.md           ← este arquivo
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
    ├── topics.yaml
    └── trends-list.yaml

src/
  app/
    api/
      topics/
        route.ts               ← GET, POST
        [slug]/
          route.ts             ← PATCH
      trends/
        route.ts               ← GET (listagem + filtros)
        sources/
          route.ts             ← GET (fontes distintas)
    trends/
      page.tsx                 ← Server Component (recebe searchParams)
      _components/
        TrendFilters.tsx       ← "use client" — controla URL via useRouter
        TrendList.tsx          ← Server Component
        TrendCard.tsx          ← Server Component
  lib/
    topics/
      service.ts
      repository.ts
      schemas.ts
    trends/
      service.ts
      repository.ts
      schemas.ts
  components/
    ui/
      TopicBadge.tsx           ← componente único de tag colorida
      ScoreBadge.tsx           ← badge nível (baixo/médio/alto/crítico)
```

---

## Architectural Decisions

### Caching
- **Decision**: NO
- **Justification**: Volume baixo de usuários internos; índices MongoDB suficientes para NFR-001 (< 2s).

### Message Queues / Background Jobs / Event Streaming
- **Decision**: NO
- **Justification**: CRUD síncrono e queries de leitura simples.

### Filtros: Server vs. Client
- **Decision**: Server Component com `searchParams` + Client Component apenas para o widget de filtros
- **Justification**: Dados chegam server-rendered (sem loading state); URL é shareável com filtros; sem estado duplicado.

### Cor de Tópico
- **Decision**: Campo `color` armazenado no banco, auto-atribuído da paleta
- **Justification**: Garante consistência cross-page (NFR-004) sem lógica computada em cada componente.

---

## Implementation Phases

### Phase 0: Research ✅
- [x] Estratégia de cor de tags (armazenar vs. computar)
- [x] Filtros via `searchParams` no App Router
- [x] Opções de período (presets)
- [x] Query MongoDB dinâmica com filtros opcionais
- [x] Paginação offset-based
- [x] Imutabilidade de slug via Mongoose
- Resultado: [`research.md`](./research.md)

### Phase 1: Design ✅
- [x] Data model: [`data-model.md`](./data-model.md)
- [x] API contracts: [`contracts/`](./contracts/)
- [x] Quickstart: [`quickstart.md`](./quickstart.md)

### Phase 2: Task Breakdown → `/specforge.tasks`

### Phase 3: Implementation

#### 3.1 — Atualizar Model Topic (adicionar campo `color`)
1. Adicionar `TOPIC_COLOR_PALETTE` e `TopicColor` em `src/lib/mongodb/models/Topic.ts`
2. Adicionar campo `color` com `default: 'blue'` no schema
3. Executar script de migração para tópicos existentes sem `color`

#### 3.2 — Lib de Tópicos
1. `src/lib/topics/schemas.ts` — `CreateTopicSchema`, `UpdateTopicSchema`, `TopicResponseSchema`
2. `src/lib/topics/repository.ts` — `findAllTopics`, `findTopicBySlug`, `createTopic`, `updateTopicDescription`
3. `src/lib/topics/service.ts` — lógica de negócio: geração de slug, auto-assign de cor, validação de unicidade

#### 3.3 — API Routes de Tópicos
1. `src/app/api/topics/route.ts` — `GET` (listar) e `POST` (criar) com validação Zod
2. `src/app/api/topics/[slug]/route.ts` — `PATCH` (atualizar descrição)

#### 3.4 — Lib de Tendências (listagem)
1. `src/lib/trends/schemas.ts` — `TrendFiltersSchema`, `TrendListItemSchema`, `TrendListResponseSchema`
2. `src/lib/trends/repository.ts` — `buildTrendQuery`, `findTrendsPaginated`, `listDistinctSources`
3. `src/lib/trends/service.ts` — `listTrends` (join com cor do tópico), `listSources`

#### 3.5 — API Routes de Tendências
1. `src/app/api/trends/route.ts` — `GET` com filtros e paginação
2. `src/app/api/trends/sources/route.ts` — `GET` fontes distintas

#### 3.6 — Componentes UI
1. `src/components/ui/TopicBadge.tsx` — tag colorida reutilizável (única fonte de cor)
2. `src/components/ui/ScoreBadge.tsx` — badge de nível (1-2.49=baixo, 2.5-3.49=médio, 3.5-4.49=alto, 4.5-5=crítico)
3. `src/app/trends/_components/TrendCard.tsx` — card da tendência (título, resumo, badge, score)
4. `src/app/trends/_components/TrendFilters.tsx` — Client Component: selects de tópico, fonte, período
5. `src/app/trends/_components/TrendList.tsx` — lista de cards com estado vazio
6. `src/app/trends/page.tsx` — Server Component: recebe `searchParams`, busca dados, passa para componentes

#### 3.7 — Testes
1. Unit: `service.ts` de tópicos (geração de slug, auto-assign cor, rejeição de slug duplicado)
2. Unit: `buildTrendQuery` (cada filtro isolado + combinações)
3. Integration: `GET /api/topics`, `POST /api/topics`, `PATCH /api/topics/[slug]`
4. Integration: `GET /api/trends` (sem filtro, com cada filtro, com combinação)
5. Integration: `GET /api/trends/sources`

---

## Dependências Entre Tasks

```
3.1 (model) → 3.2 (lib topics) → 3.3 (routes topics)
            → 3.4 (lib trends) → 3.5 (routes trends) → 3.6 (UI) → 3.7 (tests)
```

---

## Riscos e Mitigações

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Tópicos sem `color` após migração | Baixa | `default: 'blue'` garante fallback; script de migração corrige explicitamente |
| Cores repetidas com muitos tópicos | Baixa | 10 cores na paleta — para MVP suficiente; expandir paleta se necessário |
| Query lenta sem índices | Baixa | Índices declarados no schema 001 cobrem todos os filtros desta feature |
| `searchParams` com valores inesperados | Média | `TrendFiltersSchema.safeParse()` rejeita input inválido com 422 |

---

## Critérios de Conclusão da Feature

- [ ] SC-001: Filtro por tópico retorna apenas tendências do tópico selecionado
- [ ] SC-002: Combinação de 3 filtros simultâneos retorna conjunto correto
- [ ] SC-003: 100% dos itens exibem score ou indicação "não avaliado"
- [ ] SC-004: Cadastro com slug duplicado retorna 409
- [ ] SC-005: Listagem com filtros responde em < 2s
- [ ] SC-006: Novo tópico aparece imediatamente nos filtros disponíveis
