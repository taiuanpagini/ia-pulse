# Architectural Decisions — IAPulse

**Stack**: Next.js 14 (App Router) + MongoDB Atlas + Vercel

---

### Caching

- **Decision**: NO (MVP)
- **Justification**: Coleta diária via cron, volume baixo de usuários internos. Next.js `fetch` cache por Server Component é suficiente. Reavaliar se consultas ao MongoDB > 500ms ou usuários > 50 simultâneos.

---

### Message Queues

- **Decision**: NO
- **Justification**: Coleta é síncrona, executada 1x/dia por cron. Volume < 200 itens/execução. Sem necessidade de processamento assíncrono distribuído.

---

### Event Streaming

- **Decision**: NO
- **Justification**: Dados são diários, não em tempo real. Nenhum padrão multi-consumer identificado.

---

### Background Jobs

- **Decision**: YES — Vercel Cron Jobs
- **Justification**: Coleta diária de múltiplas fontes externas requer execução agendada. Vercel Cron é gratuito no free tier (1 job, mínimo diário). Declarado em `vercel.json`.
- **Schedule**: `0 7 * * *` (07:00 UTC)
- **Endpoint**: `POST /api/cron/collect` protegido por `CRON_SECRET`
- **Fontes cobertas**: arXiv, HackerNews, Reddit, Semantic Scholar, Papers With Code (APIs dedicadas) + EUR-Lex, ANPD, NIST, Stanford HAI, NVIDIA Blog, Hugging Face Blog, The Batch, Import AI (RSS via adapter genérico)

---

### RSS Parsing

- **Decision**: YES — adapter genérico `rss.ts`
- **Justification**: Fontes regulatórias (EUR-Lex, ANPD) e institucionais (Stanford HAI, NIST) expõem conteúdo apenas via RSS, sem API REST. Um único adapter configurável por lista de feeds evita criar um arquivo por fonte.
- **Dependência**: `rss-parser` (npm, gratuito)

---

### Search

- **Decision**: NO (MVP)
- **Justification**: Dataset < 10K documentos por tópico. Filtros por `topicSlug`, `source` e `collectedAt` via índices MongoDB são suficientes. Reavaliar com MongoDB Atlas Search se full-text for necessário no futuro.

---

### File Storage

- **Decision**: NO
- **Justification**: Nenhum upload de arquivos ou mídia. Conteúdo coletado é apenas metadados textuais (título, resumo, URL).

---

### LLM Integration

- **Decision**: OPCIONAL — ativado por env var
- **Justification**: Scoring manual é suficiente para o MVP. LLM (Gemini free tier ou OpenAI) pode acelerar a avaliação de tendências, mas não deve ser dependência obrigatória. Ativado quando `LLM_API_KEY` e `LLM_PROVIDER` estiverem configurados.
- **Provedores suportados**: `gemini` | `openai`

---

### Authentication

- **Decision**: NO (MVP)
- **Justification**: Ferramenta interna com acesso por URL. Painel de scoring acessível a qualquer pessoa com o link. Reavaliar com NextAuth.js se necessário restringir acesso por email/domínio corporativo.

---

### Database

- **Decision**: MongoDB Atlas (free tier)
- **Justification**: Schema flexível adequado para dados heterogêneos de múltiplas fontes. Free tier (512MB) suficiente para MVP. Mongoose provê ODM tipado com suporte a TypeScript.
- **Acesso**: Singleton de conexão em `src/lib/mongodb/client.ts` (padrão para serverless)
