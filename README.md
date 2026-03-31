# IAPulse — Radar de Tendências em IA

> Sistema interno para monitorar, filtrar e avaliar tendências em Inteligência Artificial — transformando ruído em decisões de negócio.

---

## Índice

- [Para leigos: o que é e por que existe](#-para-leigos-o-que-é-e-por-que-existe)
- [Como o time usa o sistema](#-como-o-time-usa-o-sistema)
- [De onde vem as informações](#-de-onde-vem-as-informações)
- [O que são os filtros de qualidade](#-o-que-são-os-filtros-de-qualidade)
- [Como funciona a avaliação (scoring)](#-como-funciona-a-avaliação-scoring)
- [Stack tecnológica](#-stack-tecnológica)
- [Configuração e setup](#-configuração-e-setup)
- [Rodando localmente](#-rodando-localmente)
- [Deploy em produção (Vercel)](#-deploy-em-produção-vercel)
- [APIs disponíveis](#-apis-disponíveis)
- [Estrutura de pastas](#-estrutura-de-pastas)
- [Extensibilidade](#-extensibilidade)

---

## 🧭 Para leigos: o que é e por que existe

### O problema

A área de Inteligência Artificial evolui em ritmo acelerado. Todo dia surgem dezenas de novos modelos, ferramentas, frameworks, pesquisas e mudanças regulatórias. Acompanhar tudo isso manualmente é inviável: são artigos em inglês espalhados por dezenas de sites, newsletters, fóruns e repositórios acadêmicos.

Sem um sistema centralizado, o time acaba:
- Perdendo tendências relevantes por falta de tempo para garimpar
- Gastando horas lendo coisas que não têm aplicabilidade real
- Tomando decisões de PoC (prova de conceito) baseadas em feeling, não em dados estruturados

### A solução

O IAPulse é um **radar automático** que:

1. **Vasculha a internet** toda semana em busca de novidades em IA — papers acadêmicos, posts de comunidades técnicas, artigos de blogs especializados, notícias de mercado e atualizações regulatórias
2. **Filtra o ruído** com critérios rigorosos: só entra conteúdo com alto engajamento da comunidade técnica, publicações recentes e temas com aplicabilidade real
3. **Organiza tudo em um painel** acessível a qualquer membro do time, separado por categorias (Infraestrutura, Regulamentação, Geral)
4. **Permite que analistas avaliem** cada item com uma nota estruturada de 1 a 5 em 5 critérios de negócio
5. **Ranqueia as tendências** do mês com base nas notas, para que o time saiba exatamente onde focar energia para PoCs

### O resultado esperado

- **20 a 40 itens novos por semana**, todos pré-filtrados e relevantes
- Time gasta tempo avaliando, não garimpando
- Decisões de PoC baseadas em critérios objetivos e documentados
- Histórico de avaliações por mês, para rastrear o que foi aprovado, descartado e explorado

---

## 👥 Como o time usa o sistema

### Fluxo semanal

```
[Automático - toda semana]
Sistema coleta de 15+ fontes
       ↓
Filtra por qualidade (engajamento, data, relevância)
       ↓
Deduplica (nunca salva o mesmo artigo duas vezes)
       ↓
Aparece no dashboard em "Aguardando avaliação"

[Manual - analistas do time]
Analista lê o resumo e acessa o link original
       ↓
Avalia em 5 critérios (1 a 5 em cada)
       ↓ 
Sistema calcula nota ponderada automaticamente
       ↓
Analista marca como "Aprovado" (vai para PoC) 
   ou "Descartado" (mal classificado / irrelevante)

[Gestão]
Dashboard mostra ranking do mês
Aba "Aprovados" = candidatos a PoC
Aba "Descartados" = histórico de descartes
Rankings anteriores acessíveis para comparação
```

### O que cada status significa

| Status | Significado |
|---|---|
| **Aguardando avaliação** | Item coletado, ainda não avaliado |
| **Ranking** | Item avaliado com nota, aguardando decisão |
| **Aprovado** | Time decidiu seguir com investigação / PoC |
| **Descartado** | Irrelevante para o negócio ou mal classificado |

---

## 🌐 De onde vem as informações

O sistema coleta de **três tipos de fonte**:

### 1. Comunidades técnicas (APIs)

São fóruns e plataformas onde desenvolvedores e pesquisadores discutem e validam novidades. O sistema só pega o que a própria comunidade já considerou relevante (medido por votos, citações e engajamento).

| Fonte | O que é | Por que usamos |
|---|---|---|
| **HackerNews** | Fórum da comunidade de tecnologia do Vale do Silício | Posts com 300+ pontos e 20+ comentários = genuinamente relevante para o mercado |
| **Reddit** | Subreddits r/MachineLearning e r/LocalLLaMA | Posts com 500+ upvotes na semana = temas quentes na comunidade técnica |

### 2. Pesquisa acadêmica (APIs)

Papers e artigos científicos com evidência de impacto real.

| Fonte | O que é | Por que usamos |
|---|---|---|
| **arXiv** | Repositório de pre-prints de IA e computação | Papers mais recentes de ML aplicado e infraestrutura |
| **Semantic Scholar** | Base de papers com contagem de citações | Papers dos últimos 12 meses com 10+ citações = reconhecimento da comunidade científica |
| **Papers With Code** | Papers que vieram com código público (GitHub) | Se tem código publicado, é implementável — direto para PoC |

### 3. Blogs e newsletters curados (RSS)

Publicações de organizações referência que já fazem curadoria editorial.

| Categoria | Fontes |
|---|---|
| **Infraestrutura** | NVIDIA Developer Blog, Hugging Face Blog, Google AI Blog |
| **Regulamentação** | Future of Life Institute, Import AI |
| **Notícias de mercado** | VentureBeat AI, MIT Technology Review AI, TechCrunch AI, The Decoder |
| **Brasil** | Olhar Digital |

> Para documentação técnica detalhada de cada fonte, veja [`docs/FONTES-DE-DADOS.md`](docs/FONTES-DE-DADOS.md).

---

## 🔍 O que são os filtros de qualidade

O IAPulse não coleta "tudo" — ele aplica filtros para garantir que só entra o que tem valor real:

### Filtros por engajamento (comunidades)

| Fonte | Filtro aplicado |
|---|---|
| HackerNews | Mínimo 300 pontos + 20 comentários + publicado nos últimos 8 dias |
| Reddit | Mínimo 500 upvotes + publicado nos últimos 8 dias |
| Semantic Scholar | Mínimo 10 citações + publicado nos últimos 12 meses |
| Papers With Code | Apenas papers com repositório GitHub público |

### Filtros por palavras-chave (notícias)

Para feeds de notícias abertas (TechCrunch, VentureBeat, MIT Tech Review, The Decoder, Olhar Digital), o sistema só aceita artigos que mencionam pelo menos uma palavra-chave de **IA aplicada**:

- Modelos: `LLM`, `GPT`, `Claude`, `Gemini`, `Llama`, `Mistral`, `open-source`
- Infraestrutura: `deploy`, `inference`, `quantization`, `fine-tuning`, `RAG`, `GPU`, `optimization`
- Aplicação: `enterprise`, `implementation`, `agent`, `automation`, `benchmark`, `API`
- Regulação: `compliance`, `AI Act`, `LGPD`, `GDPR`, `governance`

Isso elimina artigos de opinião, perfis de pessoas, notícias de mercado financeiro e qualquer coisa que não tenha relação com IA aplicável.

### Por que não duplica entre coletas

Cada artigo tem uma URL única. O sistema faz um **upsert por URL** — se o artigo já está no banco, é ignorado silenciosamente. Você nunca verá o mesmo artigo duas vezes no dashboard, mesmo rodando a coleta várias vezes.

---

## 📊 Como funciona a avaliação (scoring)

Cada analista avalia uma tendência em **5 critérios**, cada um em escala de 1 a 5:

| Critério | Peso | O que significa |
|---|---|---|
| **Maturidade Tecnológica** | 20% | 1 = ainda pesquisa / 5 = já em produção no mercado |
| **Aplicabilidade Imediata** | 30% | 1 = nenhuma aplicação óbvia / 5 = podemos usar direto |
| **Impacto Competitivo** | 25% | 1 = melhoria incremental / 5 = pode mudar o jogo |
| **Alinhamento Estratégico** | 15% | 1 = fora do nosso foco / 5 = totalmente alinhado |
| **Complexidade de Adoção** | 10% | 1 = muito difícil de adotar / 5 = fácil de adotar |

**O score total é calculado automaticamente** e vai de 1.0 a 5.0:

```
score = (Maturidade × 0.20) + (Aplicabilidade × 0.30) + (Impacto × 0.25)
      + (Alinhamento × 0.15) + (Complexidade × 0.10)
```

Todos os critérios com nota máxima (5) resultam em score 5.0.

### Interpretação do score

| Faixa | Badge | Interpretação |
|---|---|---|
| 1.0 – 2.49 | 🔵 Baixo | Pouco relevante no momento |
| 2.50 – 3.49 | 🟡 Médio | Acompanhar, mas sem prioridade |
| 3.50 – 4.49 | 🟠 Alto | Candidato forte a investigação |
| 4.50 – 5.0 | 🔴 Crítico | Prioridade máxima para PoC |

### Auto-score com IA (opcional)

Se uma chave de API do Gemini ou OpenAI estiver configurada, o botão **"Auto-score com IA"** envia o título e resumo da tendência para o modelo, que sugere notas para os 5 critérios. O analista **revisa e confirma** antes de salvar — o sistema nunca salva automaticamente sem revisão humana.

---

## 🛠 Stack tecnológica

| Camada | Tecnologia | Por quê |
|---|---|---|
| Frontend + Backend | [Next.js 14](https://nextjs.org/) (App Router) | Um único projeto para UI e API |
| UI | [Material UI](https://mui.com/) | Componentes prontos, design consistente |
| Banco de dados | [MongoDB Atlas](https://cloud.mongodb.com/) (free tier) | Schema flexível, gratuito, gerenciado |
| Deploy | [Vercel](https://vercel.com/) (free tier) | Zero configuração de servidor |
| Coleta agendada | Vercel Cron Jobs | Gratuito, integrado ao deploy |
| LLM (opcional) | Google Gemini ou OpenAI | Auto-score como sugestão para analistas |
| ODM | [Mongoose](https://mongoosejs.com/) | Tipagem e validação do MongoDB |
| Validação | [Zod](https://zod.dev/) | Schemas seguros em API e LLM |

---

## ⚙️ Configuração e setup

### Pré-requisitos

- [Node.js 18+](https://nodejs.org/) — verifique com `node -v`
- Conta no [MongoDB Atlas](https://cloud.mongodb.com/) — tier gratuito (M0) é suficiente
- Conta no [Vercel](https://vercel.com/) — tier gratuito é suficiente
- (Opcional) Chave de API do [Google AI Studio](https://aistudio.google.com/apikey) ou [OpenAI](https://platform.openai.com/api-keys)

### Configurar MongoDB Atlas

1. Acesse [cloud.mongodb.com](https://cloud.mongodb.com/) e crie uma conta
2. Crie um projeto → cluster **M0 (Free)**
3. **Database Access** → crie usuário com senha
4. **Network Access** → adicione `0.0.0.0/0` (permite acesso do Vercel)
5. **Connect → Connect your application** → copie a connection string:
   ```
   mongodb+srv://usuario:senha@cluster.mongodb.net/iapulse?retryWrites=true&w=majority
   ```

---

## 💻 Rodando localmente

### 1. Instalar dependências

```bash
npm install
```

### 2. Criar variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Edite `.env.local`:

```env
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/iapulse?retryWrites=true&w=majority
CRON_SECRET=string-secreta-com-pelo-menos-32-caracteres

# Opcional — habilita "Auto-score com IA"
# LLM_API_KEY=sua-chave-aqui
# LLM_PROVIDER=gemini   # ou: openai
```

Para gerar um `CRON_SECRET` seguro:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Criar os tópicos iniciais no banco

```bash
npm run seed
```

Cria: **Infraestrutura**, **Regulamentação** e **Geral**.

### 4. Iniciar o servidor

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

### 5. Primeira coleta de dados

**Opção A — Script direto (recomendado para testes):**

```bash
npm run collect
```

Exibe log detalhado por fonte, incluindo quantos itens foram inseridos e ignorados.

**Opção B — Via endpoint HTTP:**

```powershell
# PowerShell
Invoke-WebRequest -Method POST http://localhost:3000/api/cron/collect `
  -Headers @{ Authorization = "Bearer <seu-CRON_SECRET>" }
```

```bash
# bash / curl
curl -X POST http://localhost:3000/api/cron/collect \
  -H "Authorization: Bearer <seu-CRON_SECRET>"
```

Aguarde ~10 segundos. As tendências aparecerão na aba **Aguardando avaliação** do dashboard.

### 6. Verificar saúde do sistema

```
GET http://localhost:3000/api/health
```

Resposta esperada:

```json
{ "status": "ok", "mongodb": "connected", "durationMs": 12 }
```

---

## 🚀 Deploy em produção (Vercel)

### 1. Conectar repositório

Acesse [vercel.com/new](https://vercel.com/new), importe o repositório e siga o assistente.

### 2. Configurar variáveis de ambiente

No painel do projeto → **Settings → Environment Variables**:

| Variável | Valor |
|---|---|
| `MONGODB_URI` | Connection string do Atlas |
| `CRON_SECRET` | String segura gerada no passo de setup |
| `LLM_API_KEY` | (Opcional) Chave Gemini ou OpenAI |
| `LLM_PROVIDER` | (Opcional) `gemini` ou `openai` |

### 3. Cron job

O arquivo `vercel.json` já está configurado:

```json
{
  "crons": [
    { "path": "/api/cron/collect", "schedule": "0 7 * * 1" }
  ]
}
```

> O schedule `0 7 * * 1` executa toda **segunda-feira às 07:00 UTC** (04:00 horário de Brasília). Para alterar a frequência, basta mudar o cron expression.

Após o deploy, confirme em **Settings → Cron Jobs** no painel da Vercel.

**Limitação do free tier:** Funções serverless têm timeout de 10s. Os coletores rodam em paralelo com `Promise.allSettled()` e timeout individual de 8s por fonte — falha em uma fonte não afeta as demais.

---

## 📡 APIs disponíveis

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/health` | Status do sistema e conexão MongoDB |
| `GET` | `/api/topics` | Listar todos os tópicos |
| `POST` | `/api/topics` | Criar novo tópico |
| `PATCH` | `/api/topics/:slug` | Atualizar descrição de tópico |
| `GET` | `/api/trends` | Listar tendências (filtros + paginação) |
| `GET` | `/api/trends/sources` | Fontes coletadas distintas |
| `GET` | `/api/trends/:id` | Detalhe de uma tendência |
| `PATCH` | `/api/trends/:id/score` | Salvar avaliação |
| `PATCH` | `/api/trends/:id/status` | Atualizar status (approved/discarded/pending) |
| `POST` | `/api/trends/:id/autoscore` | Sugestão de score via LLM |
| `POST` | `/api/cron/collect` | Disparar coleta (requer `Authorization: Bearer <CRON_SECRET>`) |

---

## 📁 Estrutura de pastas

```
src/
├── app/
│   ├── page.tsx                        # Dashboard principal
│   ├── loading.tsx                     # Skeleton de carregamento
│   ├── theme.ts                        # Tema Material UI (paleta Amazing)
│   ├── ThemeRegistry.tsx               # Provider MUI + NavigationContext
│   ├── trends/[id]/
│   │   ├── page.tsx                    # Página de detalhe
│   │   ├── TrendDetailClient.tsx       # Scoring + status (client component)
│   │   └── not-found.tsx
│   └── api/
│       ├── health/                     # GET /api/health
│       ├── cron/collect/               # POST (Vercel Cron)
│       ├── topics/                     # CRUD de tópicos
│       └── trends/[id]/
│           ├── route.ts                # GET detalhe
│           ├── score/                  # PATCH score
│           ├── status/                 # PATCH status
│           └── autoscore/              # POST LLM
├── components/
│   ├── dashboard/
│   │   ├── TrendCard.tsx               # Card de tendência (scored/unscored)
│   │   ├── DashboardTabs.tsx           # Abas Ranking/Aprovados/Descartados/Aguardando
│   │   ├── DashboardFilters.tsx        # Busca, tópico, fonte, período
│   │   ├── TopCarousel.tsx             # Carrossel top 10
│   │   ├── PeriodSelector.tsx          # Seletor de mês
│   │   ├── RankedSection.tsx           # Seção de ranking
│   │   ├── AwaitingSection.tsx         # Seção aguardando avaliação
│   │   ├── StatusSection.tsx           # Aprovados / Descartados
│   │   └── Pagination.tsx
│   ├── scoring/
│   │   ├── ScoreForm.tsx               # Formulário de avaliação
│   │   ├── CriteriaInput.tsx           # Slider por critério
│   │   └── AutoScoreButton.tsx         # Botão "Auto-score com IA"
│   └── ui/
│       ├── TopicBadge.tsx
│       ├── ScoreBadge.tsx
│       ├── BackButton.tsx
│       ├── NavigationOverlay.tsx       # Overlay de loading (soft nav)
│       └── ScoreDisplay.tsx
├── contexts/
│   └── NavigationContext.tsx           # useTransition para navegação suave
└── lib/
    ├── collectors/
    │   ├── adapters/                   # arxiv, hackernews, reddit, semantic-scholar, papers-with-code, rss
    │   ├── config/rss-feeds.config.ts  # Lista de feeds RSS (extensível por config)
    │   └── orchestrator.ts             # Coleta paralela com fallback por fonte
    ├── llm/                            # Adapters Gemini e OpenAI
    ├── mongodb/
    │   ├── client.ts                   # Singleton Mongoose (serverless-safe)
    │   └── models/                     # Trend, Topic
    ├── scoring/                        # formula, levels, origin, schemas
    ├── topics/                         # service, repository, schemas
    └── trends/                         # service, repository, schemas
```

---

## 🔧 Extensibilidade

### Adicionar novo tópico

Via API (sem reiniciar nada):

```bash
curl -X POST http://localhost:3000/api/topics \
  -H "Content-Type: application/json" \
  -d '{"name": "Agentes de IA", "description": "Sistemas autônomos, multi-agentes, RAG, orquestração"}'
```

A cor é atribuída automaticamente. O slug é gerado a partir do nome.

### Adicionar novo feed RSS

Edite `src/lib/collectors/config/rss-feeds.config.ts`:

```typescript
{
  url: "https://exemplo.com/feed.xml",
  source: "Nome da Fonte",
  topicSlug: "slug-do-topico",  // deve existir no banco
  maxItems: 3,
  relevanceFilter: true,        // aplica filtro de palavras-chave de IA aplicada
}
```

Nenhuma alteração de código necessária — apenas configuração.

### Rodar testes

```bash
npm test
```

Cobre: fórmula de scoring, níveis de badge, origem do score (manual/LLM), orquestrador de coleta, repositório de tendências, tópicos e endpoint de detalhe.

---

## 📖 Documentação complementar

- [`docs/FONTES-DE-DADOS.md`](docs/FONTES-DE-DADOS.md) — Detalhamento técnico de cada fonte, filtros aplicados e como verificar manualmente
