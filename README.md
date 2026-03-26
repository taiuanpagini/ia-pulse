# IAPulse

Sistema de monitoramento de tendências em Inteligência Artificial. Coleta diariamente artigos, papers e notícias de múltiplas fontes gratuitas, organiza por tópico e permite que analistas avaliem cada tendência com um score ponderado.

---

## O que o sistema faz

- **Coleta automática** (07:00 UTC) de papers, artigos e notícias via APIs REST e feeds RSS
- **Deduplicação** por URL — a mesma fonte nunca aparece duas vezes
- **Organização por tópicos**: Infraestrutura, Regulamentação, Geral (extensível via configuração)
- **Dashboard** com ranking das tendências mais relevantes (ordenado por score)
- **Avaliação manual** com 5 critérios ponderados; opcionalmente **sugerida por LLM** (Gemini ou OpenAI) para revisão humana antes de salvar
- **Página de detalhe** de cada tendência com formulário de avaliação inline

---

## Fontes de dados

### APIs REST (adapter dedicado por fonte)

| Fonte | O que coleta | Link para verificar |
|---|---|---|
| arXiv | Papers de ML e hardware (cs.LG, cs.AR) | [arxiv.org/search/?searchtype=all&query=&start=0](https://arxiv.org/search/?searchtype=all&query=machine+learning&start=0) |
| HackerNews | Posts de IA via Algolia API | [hn.algolia.com/?query=AI](https://hn.algolia.com/?query=AI) |
| Reddit | r/MachineLearning e r/artificial | [reddit.com/r/MachineLearning](https://www.reddit.com/r/MachineLearning/) |
| Semantic Scholar | Papers acadêmicos com citações | [api.semanticscholar.org/graph/v1/paper/search](https://api.semanticscholar.org/graph/v1/paper/search?query=machine+learning&fields=title,abstract,year) |
| Papers With Code | Benchmarks, SOTA, quantização | [paperswithcode.com/api/v1/papers](https://paperswithcode.com/api/v1/papers/?page=1) |

### RSS Feeds — Infraestrutura

| Fonte | Feed | Link direto |
|---|---|---|
| NVIDIA Developer Blog | `developer.nvidia.com/blog/feed` | [developer.nvidia.com/blog](https://developer.nvidia.com/blog/) |
| Hugging Face Blog | `huggingface.co/blog/feed.xml` | [huggingface.co/blog](https://huggingface.co/blog) |
| Google AI Blog | `ai.googleblog.com/feeds/posts/default` | [ai.googleblog.com](https://ai.googleblog.com) |

### RSS Feeds — Regulamentação

| Fonte | Feed | Link direto |
|---|---|---|
| EUR-Lex AI Act | EUR-Lex RSS | [eur-lex.europa.eu](https://eur-lex.europa.eu/search.html?DB_TYPE_OF_ACT=regulation&SUBDOM_INIT=ALL_ALL&DTS_DOM=AI) |
| ANPD (Brasil) | `gov.br/anpd/pt-br/assuntos/noticias/RSS` | [gov.br/anpd](https://www.gov.br/anpd/pt-br/assuntos/noticias) |
| NIST AI RMF | `nist.gov/artificial-intelligence/rss.xml` | [nist.gov/artificial-intelligence](https://www.nist.gov/artificial-intelligence) |
| Future of Life Institute | `futureoflife.org/feed/` | [futureoflife.org](https://futureoflife.org) |
| AI Now Institute | `ainowinstitute.org/feed` | [ainowinstitute.org](https://ainowinstitute.org) |
| Stanford HAI | `hai.stanford.edu/news/rss.xml` | [hai.stanford.edu/news](https://hai.stanford.edu/news) |

### RSS Feeds — Geral

| Fonte | Feed | Link direto |
|---|---|---|
| The Batch (DeepLearning.AI) | `deeplearning.ai/the-batch/feed/` | [deeplearning.ai/the-batch](https://www.deeplearning.ai/the-batch/) |
| Import AI (Jack Clark) | `jack-clark.net/feed/` | [jack-clark.net](https://jack-clark.net) |
| VentureBeat AI | `venturebeat.com/category/ai/feed/` | [venturebeat.com/category/ai](https://venturebeat.com/category/ai/) |
| MIT Technology Review AI | `technologyreview.com/topic/artificial-intelligence/feed` | [technologyreview.com/ai](https://www.technologyreview.com/topic/artificial-intelligence/) |

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 14 (App Router), Tailwind CSS, shadcn/ui |
| Backend | Next.js API Routes |
| Banco de dados | MongoDB Atlas (free tier) via Mongoose |
| Deploy | Vercel (free tier) |
| Cron | Vercel Cron Jobs (07:00 UTC diário) |
| LLM (opcional) | Google Gemini ou OpenAI |

---

## Pré-requisitos

- [Node.js 18+](https://nodejs.org/) — `node -v` para verificar
- Conta no [MongoDB Atlas](https://cloud.mongodb.com/) — tier gratuito (M0) é suficiente
- Conta no [Vercel](https://vercel.com/) — tier gratuito é suficiente
- (Opcional) Chave de API do [Google AI Studio](https://aistudio.google.com/apikey) ou [OpenAI](https://platform.openai.com/api-keys) para o recurso de auto-score com LLM

---

## Configuração do banco de dados (MongoDB Atlas)

1. Acesse [cloud.mongodb.com](https://cloud.mongodb.com/) e crie uma conta gratuita
2. Crie um novo projeto → crie um cluster **M0 (free)**
3. Em **Database Access** → crie um usuário com senha (anote as credenciais)
4. Em **Network Access** → adicione `0.0.0.0/0` para liberar acesso do Vercel (ou o IP específico da Vercel)
5. Em **Connect** → escolha "Connect your application" → copie a connection string:
   ```
   mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
   ```
6. Substitua `<user>`, `<password>` e adicione `/iapulse` antes do `?`:
   ```
   mongodb+srv://usuario:senha@cluster0.xxxxx.mongodb.net/iapulse?retryWrites=true&w=majority
   ```

---

## Rodando localmente

### 1. Clonar e instalar dependências

```bash
git clone <url-do-repositorio>
cd IAPulse
npm install
```

### 2. Criar o arquivo de variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Editar `.env.local`:

```env
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/iapulse?retryWrites=true&w=majority
CRON_SECRET=qualquer-string-segura-com-pelo-menos-32-caracteres

# Opcional — habilita botão "Auto-score com IA"
# LLM_API_KEY=sua-chave-aqui
# LLM_PROVIDER=gemini   # ou: openai
```

Para gerar um `CRON_SECRET` seguro:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Popular o banco com os tópicos iniciais

```bash
npx ts-node -r tsconfig-paths/register src/scripts/seed-topics.ts
```

Isso cria os tópicos **Infraestrutura**, **Regulamentação** e **Geral** no MongoDB.

### 4. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

### 5. Disparar a coleta manualmente (primeira carga de dados)

O cron roda automaticamente em produção, mas localmente você pode chamar o endpoint diretamente:

```bash
curl -X POST http://localhost:3000/api/cron/collect \
  -H "Authorization: Bearer <seu-CRON_SECRET>"
```

Ou via PowerShell:
```powershell
Invoke-WebRequest -Method POST http://localhost:3000/api/cron/collect `
  -Headers @{ Authorization = "Bearer <seu-CRON_SECRET>" }
```

Aguarde alguns segundos — o sistema coleta de todas as fontes em paralelo. Ao recarregar o dashboard, as tendências aparecerão na seção "Aguardando avaliação".

### 6. Verificar saúde do sistema

```
GET http://localhost:3000/api/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "mongodb": "connected",
  "durationMs": 12
}
```

---

## Executar os testes

```bash
npm test
```

Resultado esperado: **49 testes passando** em 9 suítes cobrindo:
- Fórmula de scoring e níveis (low/medium/high/critical)
- Lógica de origem do score (manual vs LLM)
- Fluxo completo de avaliação
- Isolamento de falhas do orquestrador de coleta
- Queries dinâmicas do repositório de tendências
- Geração de slug e cor automática de tópicos
- Endpoint `GET /api/trends/[id]`

---

## Deploy no Vercel

### 1. Instalar Vercel CLI (opcional, pode usar a interface web)

```bash
npm install -g vercel
```

### 2. Fazer o deploy

```bash
vercel
```

Ou conectar o repositório diretamente em [vercel.com/new](https://vercel.com/new).

### 3. Configurar variáveis de ambiente no Vercel

No painel do projeto → **Settings → Environment Variables**, adicionar:

| Variável | Valor |
|---|---|
| `MONGODB_URI` | Connection string do Atlas |
| `CRON_SECRET` | A mesma string usada localmente |
| `LLM_API_KEY` | (Opcional) Chave Gemini ou OpenAI |
| `LLM_PROVIDER` | (Opcional) `gemini` ou `openai` |

### 4. Confirmar o cron job

O arquivo `vercel.json` já configura o cron:

```json
{
  "crons": [
    { "path": "/api/cron/collect", "schedule": "0 7 * * *" }
  ]
}
```

Após o deploy, verificar em **Settings → Cron Jobs** no painel da Vercel. O job executará diariamente às 07:00 UTC.

> **Nota (free tier):** Funções serverless têm timeout de 10 segundos no plano gratuito. Os coletores rodam em paralelo com `Promise.allSettled()` e timeout individual de 8 segundos por fonte — falhas em uma fonte não bloqueiam as demais e o total fica dentro do limite.

---

## Critério de avaliação (scoring)

Cada tendência pode ser avaliada com 5 critérios, escala 1–5:

| Critério | Peso | Escala |
|---|---|---|
| Maturidade Tecnológica | 20% | 1 = pesquisa, 5 = produção |
| Aplicabilidade Imediata | 30% | 1 = nenhuma, 5 = direta |
| Impacto Competitivo | 25% | 1 = incremental, 5 = disruptivo |
| Alinhamento Estratégico | 15% | 1 = baixo, 5 = alto |
| Complexidade de Adoção | 10% | **invertido** — 5 = muito complexa, 1 = simples |

**Fórmula:**
```
score = maturity×0.20 + applicability×0.30 + competitiveImpact×0.25
      + strategicAlignment×0.15 + (6 - adoptionComplexity)×0.10
```

**Níveis de badge:**

| Faixa | Badge |
|---|---|
| 1.00 – 2.49 | Baixo |
| 2.50 – 3.49 | Médio |
| 3.50 – 4.49 | Alto |
| 4.50 – 5.00 | Crítico |

---

## Estrutura de pastas

```
src/
├── app/
│   ├── page.tsx                      # Dashboard principal
│   ├── trends/[id]/
│   │   ├── page.tsx                  # Página de detalhe
│   │   ├── not-found.tsx             # 404 customizado
│   │   └── TrendDetailClient.tsx     # Client wrapper do ScoreForm
│   └── api/
│       ├── health/                   # GET /api/health
│       ├── cron/collect/             # POST /api/cron/collect (Vercel Cron)
│       ├── topics/                   # GET/POST /api/topics
│       ├── topics/[slug]/            # PATCH /api/topics/:slug
│       └── trends/
│           ├── route.ts              # GET /api/trends (listagem paginada)
│           ├── sources/              # GET /api/trends/sources
│           └── [id]/
│               ├── route.ts          # GET /api/trends/:id
│               ├── score/            # PATCH /api/trends/:id/score
│               └── autoscore/        # POST /api/trends/:id/autoscore
├── components/
│   ├── dashboard/                    # TrendCard, RankedSection, AwaitingSection, TopicFilterBar
│   ├── trend/                        # TrendDetailHeader, ScoreDisplay
│   ├── scoring/                      # ScoreForm, CriteriaInput, AutoScoreButton
│   └── ui/                           # TopicBadge, ScoreBadge, ScoreOriginBadge
└── lib/
    ├── collectors/
    │   ├── adapters/                 # arxiv, hackernews, reddit, semantic-scholar, papers-with-code, rss
    │   ├── config/rss-feeds.config.ts  # Lista de feeds RSS (extensível)
    │   └── orchestrator.ts           # Coleta paralela com fallback por fonte
    ├── llm/                          # Adapters Gemini e OpenAI
    ├── mongodb/
    │   ├── client.ts                 # Singleton Mongoose (serverless-safe)
    │   └── models/                   # Trend, Topic
    ├── scoring/                      # formula, levels, origin, schemas
    ├── topics/                       # service, repository, schemas
    └── trends/                       # service, repository, schemas
```

---

## Adicionando novos tópicos

Via API:

```bash
curl -X POST http://localhost:3000/api/topics \
  -H "Content-Type: application/json" \
  -d '{"name": "Agentes de IA", "description": "Sistemas autônomos, multi-agentes, RAG"}'
```

A cor é atribuída automaticamente a partir da paleta (`blue`, `emerald`, `violet`, `amber`, `rose`, `cyan`, `orange`, `teal`, `pink`, `indigo`).

## Adicionando novos feeds RSS

Editar `src/lib/collectors/config/rss-feeds.config.ts` e adicionar um objeto ao array `RSS_FEEDS`:

```typescript
{
  url: "https://exemplo.com/feed.xml",
  source: "Nome da Fonte",
  topicSlug: "slug-do-topico",   // deve existir no banco
}
```

Sem alteração de código — apenas configuração.

---

## APIs disponíveis

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/health` | Status do sistema e conexão MongoDB |
| `GET` | `/api/topics` | Listar todos os tópicos |
| `POST` | `/api/topics` | Criar novo tópico |
| `PATCH` | `/api/topics/:slug` | Atualizar descrição de tópico |
| `GET` | `/api/trends` | Listar tendências (com filtros e paginação) |
| `GET` | `/api/trends/sources` | Listar fontes distintas coletadas |
| `GET` | `/api/trends/:id` | Detalhe de uma tendência |
| `PATCH` | `/api/trends/:id/score` | Salvar avaliação de uma tendência |
| `POST` | `/api/trends/:id/autoscore` | Solicitar sugestão de score via LLM |
| `POST` | `/api/cron/collect` | Disparar coleta manualmente (requer `Authorization: Bearer <CRON_SECRET>`) |
