# Fontes de Dados — IAPulse

Documentação técnica de cada fonte de dados integrada ao IAPulse: como funciona, o que filtra, thresholds configurados e como verificar manualmente.

---

## Visão geral

O IAPulse usa **dois tipos de integração**:

| Tipo | Como funciona | Adapter |
|---|---|---|
| **APIs REST** | Consulta com parâmetros de filtro direto na API | Um adapter dedicado por fonte |
| **RSS Feeds** | Lê o feed XML, aplica filtros opcionais | Um adapter genérico configurável |

Todos os adapters rodam em **paralelo** via `Promise.allSettled()` — falha em uma fonte não afeta as demais. Cada adapter tem timeout individual de **8 segundos**.

A coleta usa janela de **8 dias** nas fontes que suportam filtro por data, garantindo que coletas semanais tragam apenas conteúdo genuinamente novo.

---

## APIs REST ativas

### arXiv

**O que é:** Repositório de pre-prints científicos. Papers são submetidos antes da revisão por pares — são cutting-edge, mas ainda não validados formalmente.

**Por que usamos:** É onde os pesquisadores publicam primeiro. Representa o estado da arte em ML/IA.

**Como filtramos:**

```
Queries aplicadas:
  - cat:cs.LG AND (ti:quantization OR ti:deployment OR ti:inference OR ti:optimization)
    → tópico: infraestrutura (cs.LG = Machine Learning)

  - cat:cs.CY AND (ti:regulation OR ti:governance OR ti:compliance OR ti:policy OR ti:ethics)
    → tópico: regulamentação (cs.CY = Computers and Society — categoria correta para IA e regulação)

Ordenação: data de submissão (mais recente primeiro)
Limite: 3 papers por query = 6 total
```

**Verificar manualmente:** [arxiv.org/search/?query=LLM+deployment](https://arxiv.org/search/?searchtype=all&query=LLM+deployment&start=0)

---

### HackerNews (via Algolia API)

**O que é:** Fórum da comunidade técnica do Vale do Silício. Posts são upvotados por engenheiros e pesquisadores — alto engajamento = genuinamente relevante para o mercado.

**Por que usamos:** Um dos melhores sinais de "o que a comunidade técnica considera importante hoje".

**Como filtramos:**

```
Queries: "LLM production deployment", "AI tool launch enterprise", "machine learning open source release"
Filtros:
  - points >= 300
  - num_comments >= 20
  - created_at_i >= 8 dias atrás (só posts novos)
Limite: 4 resultados por query
```

**Verificar manualmente:** [hn.algolia.com/?query=LLM+production&dateRange=pastWeek](https://hn.algolia.com/?query=LLM+production&dateRange=pastWeek)

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
  - citationCount >= 10 (padrão); >= 5 para regulamentação (papers de policy citam menos)
  - publicationDateOrYear >= 12 meses atrás
  - Ordenado por citações decrescente
  - Delay de 1.5s entre queries (evitar rate limit 429)
Limite: 3 papers por query = 9 total (após filtro)
```

**Verificar manualmente:** [semanticscholar.org/search?q=LLM+enterprise](https://www.semanticscholar.org/search?q=LLM+enterprise&sort=Relevance)

> **Nota:** A API pública tem rate limit. Pode retornar 429 se chamada muito próximo de uma execução anterior. Em produção (1x/semana), funciona normalmente.

---

## APIs REST removidas

| Fonte | Motivo |
|---|---|
| **Reddit** | Bloqueia IPs de datacenter (AWS/Vercel) com HTTP 403. Funciona localmente mas não em cloud. |
| **Papers With Code** | API retorna HTML em vez de JSON quando chamada de servidor cloud. |

> Se quiser usar essas fontes localmente via `npm run collect`, os adapters ainda existem em `src/lib/collectors/adapters/`. Basta reativá-los no `orchestrator.ts`.

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

Fontes curadas editorialmente (NVIDIA, Hugging Face, Import AI) **não precisam de filtro** — já publicam apenas conteúdo técnico de IA.

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
| AlgorithmWatch | `algorithmwatch.org/en/feed/` | 3 | **Sim** |

**Verificar:**
- [algorithmwatch.org](https://algorithmwatch.org)

#### Geral — Newsletter curada

| Fonte | URL do feed | maxItems | Filtro |
|---|---|---|---|
| Import AI | `jack-clark.net/feed/` | 3 | Não (curado) |

**Verificar:**
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

## Feeds RSS removidos

| Fonte | Motivo da remoção |
|---|---|
| Future of Life Institute | Timeout consistente > 8s em produção (substituído por AlgorithmWatch) |
| EUR-Lex AI Act | XML malformado / feed instável |
| ANPD (Brasil) | HTTP 404 — URL mudou |
| NIST AI RMF | HTTP 404 — URL mudou |
| AI Now Institute | HTTP 403 — bloqueia bots |
| Stanford HAI | XML com atributos inválidos |
| The Batch (DeepLearning.AI) | HTTP 404 — feed descontinuado |
| Canaltech | HTTP 404 — URL mudou |
| MCTI Brasil | HTTP 404 — URL mudou |

Para reativar qualquer feed quando o problema for corrigido, basta adicionar o objeto em `rss-feeds.config.ts`.

---

## Volume de coleta esperado

Com as fontes ativas, a coleta semanal típica produz:

| Fonte | Tópico | Itens esperados (novos/semana) |
|---|---|---|
| arXiv | Infraestrutura + Regulamentação | 3–6 |
| HackerNews | Geral | 2–5 |
| Semantic Scholar | Infra + Regulamentação + Geral | 2–5 |
| NVIDIA Developer Blog | Infraestrutura | 2–3 |
| Hugging Face Blog | Infraestrutura | 2–3 |
| Google AI Blog | Infraestrutura | 2–3 |
| AlgorithmWatch | Regulamentação | 1–3 (após filtro) |
| Import AI | Geral | 2–3 |
| VentureBeat AI | Geral | 2–4 (após filtro) |
| MIT Technology Review AI | Geral | 1–3 (após filtro) |
| TechCrunch AI | Geral | 2–4 (após filtro) |
| The Decoder | Geral | 1–3 (após filtro) |
| Olhar Digital | Geral | 1–2 (após filtro) |
| **Total estimado** | | **20–40 novos por semana** |

O sistema deduplica por URL — itens já coletados anteriormente são ignorados automaticamente.
