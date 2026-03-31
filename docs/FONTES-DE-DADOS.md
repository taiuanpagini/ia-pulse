# Fontes de Dados — IAPulse

Documentação técnica de cada fonte de dados integrada ao IAPulse: como funciona, o que filtra, thresholds configurados e como verificar manualmente.

---

## Visão geral

O IAPulse usa **dois tipos de integração**:

| Tipo | Como funciona | Adapter |
|---|---|---|
| **APIs REST** | Consulta com parâmetros de filtro direto na API | Um adapter dedicado por fonte |
| **RSS Feeds** | Lê o feed XML, aplica filtros opcionais | Um adapter genérico configurável |

Todos os adapters rodam em **paralelo** via `Promise.allSettled()` — falha em uma fonte não afeta as demais. Cada adapter tem timeout individual de **8 segundos** (limite do Vercel free tier).

A coleta usa janela de **8 dias** nas fontes que suportam filtro por data, garantindo que coletas semanais tragam apenas conteúdo genuinamente novo.

---

## APIs REST

### arXiv

**O que é:** Repositório de pre-prints científicos. Papers são submetidos antes da revisão por pares — são cutting-edge, mas ainda não validados formalmente.

**Por que usamos:** É onde os pesquisadores publicam primeiro. Representa o estado da arte em ML/IA.

**Como filtramos:**

```
Categorias: cs.LG (Machine Learning) + cs.AR (Hardware Architecture)
Queries aplicadas:
  - cat:cs.LG AND (ti:quantization OR ti:deployment OR ti:inference OR ti:optimization)
  - cat:cs.LG AND (ti:regulation OR ti:privacy OR ti:compliance OR ti:governance)
Ordenação: data de submissão (mais recente primeiro)
Limite: 3 papers por query = 6 total
```

**Verificar manualmente:** [arxiv.org/search/?searchtype=all&query=LLM+deployment](https://arxiv.org/search/?searchtype=all&query=LLM+deployment&start=0)

---

### HackerNews (via Algolia API)

**O que é:** Fórum da comunidade técnica do Vale do Silício. Posts são upvotados por engenheiros e pesquisadores — alto engajamento = genuinamente relevante para o mercado.

**Por que usamos:** É um dos melhores sinais de "o que a comunidade técnica considera importante hoje".

**Como filtramos:**

```
Queries: "LLM production deployment", "AI tool launch enterprise", "machine learning open source release"
Filtros:
  - points >= 300 (era 50 — aumentado 6x)
  - num_comments >= 20
  - created_at_i >= 8 dias atrás (só posts novos)
Limite: 4 resultados por query
```

**Verificar manualmente:** [hn.algolia.com/?query=LLM+production&dateRange=pastWeek](https://hn.algolia.com/?query=LLM+production&dateRange=pastWeek)

---

### Reddit

**O que é:** Subreddits técnicos de IA. Posts com muitos upvotes representam temas quentes na comunidade de ML/LLM.

**Subreddits monitorados:**

| Subreddit | Tópico | Por quê |
|---|---|---|
| r/MachineLearning | Infraestrutura | Pesquisadores e engenheiros de ML — papers e implementações |
| r/LocalLLaMA | Infraestrutura | Comunidade de LLMs locais — quantização, edge, open-source |
| r/artificial | Geral | Notícias gerais de IA com ampla audiência |

**Como filtramos:**

```
Score mínimo: 500 upvotes (era 20 — aumentado 25x)
Janela: criados nos últimos 8 dias
Máximo: 3 posts por subreddit = 9 total
Ordenação: hot (os mais engajados no momento)
```

**Verificar manualmente:** [reddit.com/r/MachineLearning/top/?t=week](https://www.reddit.com/r/MachineLearning/top/?t=week)

---

### Semantic Scholar

**O que é:** Base de dados de papers científicos com contagem de citações. Diferente do arXiv, mostra o quanto outros pesquisadores citaram o trabalho — indicador de impacto real.

**Por que usamos:** Citações = validação pela comunidade científica. Um paper com 10+ citações já foi reconhecido como relevante.

**Como filtramos:**

```
Queries:
  - "LLM fine-tuning production enterprise" → tópico: infraestrutura
  - "AI regulation compliance enterprise risk" → tópico: regulamentação
  - "AI business application ROI deployment" → tópico: geral

Filtros:
  - citationCount >= 10 (era 1 — aumentado 10x)
  - publicationDateOrYear >= 12 meses atrás (últimos 12 meses)
  - Ordenado por citações decrescente
Limite: 3 papers por query = 9 total (após filtro)
```

**Verificar manualmente:** [api.semanticscholar.org/graph/v1/paper/search?query=LLM+enterprise&fields=title,citationCount,year](https://api.semanticscholar.org/graph/v1/paper/search?query=LLM+enterprise&fields=title,citationCount,year&limit=5)

> **Nota:** A API tem rate limit. Se rodar o script de coleta várias vezes seguidas, pode retornar 429 (Too Many Requests). Em produção (1x/semana), funciona normalmente.

---

### Papers With Code

**O que é:** Plataforma que indexa papers de ML que vêm acompanhados de código no GitHub. É o indicador mais direto de "implementabilidade".

**Por que usamos:** Se o paper tem código público, podemos reproduzir, estudar e adaptar para PoC. Sem código = teoria apenas.

**Como filtramos:**

```
Endpoint: /api/v1/papers/?ordering=-github_link
Filtro obrigatório: apenas papers com github_link != null
Limite: 5 papers (os com mais links para código)
```

**Verificar manualmente:** [paperswithcode.com/latest](https://paperswithcode.com/latest)

---

## RSS Feeds

### Como funciona o adapter genérico

Todos os RSS feeds usam o mesmo adapter (`src/lib/collectors/adapters/rss.ts`), configurado via `src/lib/collectors/config/rss-feeds.config.ts`.

Parâmetros por feed:

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `url` | string | URL do feed RSS |
| `source` | string | Nome exibido no dashboard |
| `topicSlug` | string | Slug do tópico associado |
| `maxItems` | number | Máximo de itens coletados (default: 3) |
| `lang` | `"pt"` \| `"en"` | Idioma do conteúdo |
| `relevanceFilter` | boolean | Ativa filtro por palavras-chave de IA aplicada |

### Filtro de relevância por palavras-chave

Feeds com `relevanceFilter: true` só aceitam itens cujo título ou resumo contenha ao menos uma das palavras-chave de IA aplicada:

```
Modelos:        llm, gpt, claude, gemini, llama, mistral, phi, qwen, grok,
                model release, open-source, sdk, api

Infraestrutura: deploy, production, inference, quantization, fine-tuning,
                rag, embeddings, vector, gpu, tpu, edge computing, optimization

Aplicação:      enterprise, startup, implementation, integration, workflow,
                automation, agent, benchmark, performance, cost, roi,
                tool, platform, framework, library, launch, release

Regulação:      regulation, compliance, ai act, lgpd, gdpr, policy,
                governance, anpd, nist, law, legislation

Português:      inteligência artificial, regulamentação, conformidade,
                implementação, ferramenta, modelo, agente, automação
```

Fontes curadas editorialmente (NVIDIA, Hugging Face, Import AI, Future of Life) **não precisam de filtro** — já publicam apenas conteúdo técnico de IA.

---

### Feeds ativos

#### Infraestrutura

| Fonte | URL do feed | maxItems | Filtro |
|---|---|---|---|
| NVIDIA Developer Blog | `developer.nvidia.com/blog/feed` | 3 | Não (curado) |
| Hugging Face Blog | `huggingface.co/blog/feed.xml` | 3 | Não (curado) |
| Google AI Blog | `blog.google/technology/ai/rss/` | 3 | Não (curado) |

**Verificar:**
- [developer.nvidia.com/blog](https://developer.nvidia.com/blog/)
- [huggingface.co/blog](https://huggingface.co/blog)
- [blog.google/technology/ai](https://blog.google/technology/ai/)

#### Regulamentação

| Fonte | URL do feed | maxItems | Filtro |
|---|---|---|---|
| Future of Life Institute | `futureoflife.org/feed/` | 2 | Não (curado) |
| Import AI | `jack-clark.net/feed/` | 3 | Não (curado) |

**Verificar:**
- [futureoflife.org](https://futureoflife.org)
- [jack-clark.net](https://jack-clark.net)

#### Notícias de mercado

| Fonte | URL do feed | maxItems | Filtro |
|---|---|---|---|
| VentureBeat AI | `venturebeat.com/category/ai/feed/` | 4 | **Sim** |
| MIT Technology Review AI | `technologyreview.com/topic/artificial-intelligence/feed` | 3 | **Sim** |
| TechCrunch AI | `techcrunch.com/category/artificial-intelligence/feed/` | 4 | **Sim** |
| The Decoder | `the-decoder.com/feed/` | 3 | **Sim** |

**Verificar:**
- [venturebeat.com/category/ai](https://venturebeat.com/category/ai/)
- [technologyreview.com/topic/artificial-intelligence](https://www.technologyreview.com/topic/artificial-intelligence/)
- [techcrunch.com/category/artificial-intelligence](https://techcrunch.com/category/artificial-intelligence/)
- [the-decoder.com](https://the-decoder.com)

#### Brasil

| Fonte | URL do feed | maxItems | Filtro |
|---|---|---|---|
| Olhar Digital | `olhardigital.com.br/feed/` | 2 | **Sim** |

**Verificar:**
- [olhardigital.com.br](https://olhardigital.com.br)

---

## Feeds removidos (e por quê)

Estes feeds foram testados e removidos por estarem inacessíveis ou com problemas técnicos:

| Fonte | Motivo da remoção |
|---|---|
| EUR-Lex AI Act | XML malformado / feed instável |
| ANPD (Brasil) | HTTP 404 — URL mudou |
| NIST AI RMF | HTTP 404 — URL mudou |
| AI Now Institute | HTTP 403 — bloqueia bots |
| Stanford HAI | XML com atributos inválidos |
| The Batch (DeepLearning.AI) | HTTP 404 — feed descontinuado |
| Canaltech | HTTP 404 — URL mudou |
| MCTI Brasil | HTTP 404 — URL mudou |

Se alguma dessas fontes corrigir a URL do feed, basta reativar em `rss-feeds.config.ts`.

---

## Como estimar o volume de coleta

Com os filtros atuais, a coleta semanal típica produz:

| Fonte | Itens esperados (novos/semana) |
|---|---|
| arXiv | 3–6 |
| HackerNews | 2–5 |
| Reddit | 2–6 |
| Semantic Scholar | 2–5 (sujeito a rate limit) |
| Papers With Code | 0–5 (sujeito a disponibilidade da API) |
| RSS Feeds (todos) | 10–20 (após filtro de relevância) |
| **Total estimado** | **20–40 novos por semana** |

O sistema deduplica por URL — itens já coletados anteriormente são ignorados automaticamente.
