# IAPulse Constitution — Next.js + MongoDB Atlas

## Core Principles

### I. Layered Architecture

- O backend MUST seguir arquitetura em camadas dentro das API Routes: route handler → service → repository (model Mongoose)
- Cada domínio (trends, topics, scoring, collectors) MUST ter seus módulos isolados em `src/lib/`
- Comunicação entre domínios MUST passar por funções de serviço, nunca acessar models de outro domínio diretamente
- A lógica de negócio MUST ficar em `src/lib/`, nunca dentro das API Routes (`route.ts`)
- O frontend MUST organizar código por feature/domínio, não por tipo de arquivo

### II. Type Safety (NON-NEGOTIABLE)

- TypeScript strict mode MUST estar habilitado (`"strict": true` em `tsconfig.json`)
- `any` é PROIBIDO; use `unknown` com type guard quando necessário
- Todos os shapes de request/response de API MUST ter schema Zod correspondente
- Todos os models Mongoose MUST ter interface TypeScript explícita
- Inferência de tipo via `z.infer<typeof Schema>` MUST ser usada para evitar duplicação de tipos

### III. API Design

- Todas as API Routes MUST seguir convenções RESTful (verbos HTTP corretos, status codes semânticos)
- Validação de request MUST usar Zod antes de qualquer lógica de negócio
- Respostas de erro MUST seguir estrutura consistente: `{ "error": { "code": string, "message": string } }`
- Paginação MUST ser offset-based: `?page=1&limit=20`
- O endpoint de cron (`/api/cron/collect`) MUST validar `Authorization: Bearer CRON_SECRET` antes de executar qualquer coleta

### IV. Banco de Dados (MongoDB Atlas)

- Acesso ao banco MUST ser feito exclusivamente via Mongoose
- A conexão MUST usar o padrão singleton em `src/lib/mongodb/client.ts` para evitar múltiplas conexões em ambiente serverless
- Schemas Mongoose MUST ter validação habilitada (`strict: true`)
- Não existe migration formal; mudanças de schema MUST ser retrocompatíveis ou incluir script de migração documentado
- Índices MUST ser declarados no schema Mongoose e não criados manualmente
- Soft delete MUST ser usado para trends (campo `deletedAt`); hard delete apenas para dados temporários
- Nunca expor `__v` ou `_id` bruto na API; usar `.toJSON()` com transform configurado no schema

### V. Coleta de Dados (Collectors)

- Cada fonte externa MUST ter seu próprio adapter isolado em `src/lib/collectors/`
- Adapters MUST implementar a interface `CollectorResult`: `{ title, summary, url, source, topicSlug }`
- Falha em um collector MUST ser isolada — não deve impedir os outros de executar (try/catch por adapter)
- Deduplicação MUST ser feita por `url` antes de inserir no banco (`upsert` com `url` como chave única)
- Collectors MUST respeitar rate limits das APIs externas (sem burst requests)

### VI. Scoring

- A fórmula MUST ser implementada em `src/lib/scoring/formula.ts` e ser a única fonte de verdade
- `total = (maturity×0.20) + (applicability×0.30) + (competitiveImpact×0.25) + (strategicAlignment×0.15) + (adoptionComplexity×0.10)`
- `adoptionComplexity` é invertido conceitualmente (5=muito complexa), mas o valor armazenado é o score direto — a inversão é aplicada na fórmula se necessário; documentar a convenção adotada
- O campo `scoredBy` MUST ser `"manual"` ou `"llm"`, nunca `null` após o score ser salvo
- A integração LLM MUST ser ativada exclusivamente via `LLM_API_KEY` e `LLM_PROVIDER` — código MUST funcionar sem ela

### VII. Segurança

- `CRON_SECRET` MUST validar todas as requisições ao endpoint de cron
- Variáveis sensíveis MUST NUNCA ser expostas via `NEXT_PUBLIC_` prefix
- CORS é gerenciado automaticamente pelo Vercel/Next.js; não configurar manualmente sem necessidade documentada
- Chaves de API de LLM MUST ficar exclusivamente em variáveis de ambiente server-side

### VIII. Error Handling & Observabilidade

- Todas as API Routes MUST ter try/catch e retornar respostas de erro estruturadas (nunca deixar erros não tratados)
- Erros de coleta MUST ser logados com contexto (fonte, query, mensagem de erro)
- O endpoint `/api/health` MUST verificar conectividade com MongoDB e retornar status JSON
- `console.error` é aceitável no MVP; migrar para structured logging (Pino) em versão futura

### IX. Frontend Standards (Next.js App Router + shadcn/ui)

- Usar Server Components por padrão; `"use client"` apenas quando necessário (interatividade, hooks)
- UI MUST usar shadcn/ui como biblioteca primária, com Tailwind CSS para customização
- Tailwind arbitrary values (ex: `h-[600px]`) são DESENCORAJADOS — usar design tokens do Tailwind
- Componentes customizados MUST compor primitivos do shadcn/ui
- Data fetching em Server Components MUST usar `fetch` com revalidação ou direto via Mongoose (server-side)
- Estado de cliente MUST usar `useState`/`useReducer` para UI local; TanStack Query para cache de API calls em Client Components
- Formulários MUST usar React Hook Form + Zod + componentes `<Form>` do shadcn/ui
- Ícones MUST usar Lucide React
- Todos os estados de loading, erro e vazio MUST ser tratados com padrões consistentes (shadcn `<Skeleton>`, mensagens de erro inline)
- Dark mode MUST ser suportado via sistema de variáveis CSS do shadcn/ui
- Design MUST ser responsivo usando prefixos Tailwind (`sm:`, `md:`, `lg:`)

### X. Ambiente & Deploy (Vercel)

- Deploy MUST ser feito via Vercel com integração Git
- Variáveis de ambiente MUST ser configuradas no painel Vercel (nunca hardcoded)
- Cron Job MUST ser declarado em `vercel.json` com schedule diário às 07:00 UTC
- `MONGODB_URI` MUST apontar para o cluster Atlas com usuário de mínimo privilégio (readWrite na database específica)
- O projeto MUST seguir os princípios 12-factor para configuração

### XI. Gestão de Dependências

- Gerenciador de pacotes: `npm` (padrão Next.js)
- `package.json` é a fonte de verdade para dependências
- Dependências de desenvolvimento MUST estar em `devDependencies`
- Não instalar dependências desnecessárias — avaliar bundle impact antes de adicionar

## Architectural Decision Requirements

- Caching, filas, streaming e background jobs MUST ser avaliados antes de adicionar nova infraestrutura
- Qualquer nova fonte de dados (collector) MUST implementar a interface `CollectorResult`
- LLM integrations MUST ser opcionais e ativáveis por env var, nunca obrigatórias

## Governance

- Esta constitution supersede todas as outras práticas de desenvolvimento do projeto
- Alterações requerem: rationale documentado e atualização do `architectural-decisions.md`
- Exceções MUST ser documentadas inline com justificativa

**Version**: 2.0.0 | **Stack**: Next.js 14 + MongoDB Atlas + Vercel | **Last Amended**: 2026-03-25
