export interface RssFeedConfig {
  url: string;
  source: string;
  topicSlug: string;
  maxItems?: number;       // default: 3
  lang?: "pt" | "en";
  /** Aplica filtro de palavras-chave de IA aplicada. Use em feeds de notícias
   *  genéricas para eliminar artigos de opinião sem aplicabilidade real. */
  relevanceFilter?: boolean;
}

export const RSS_FEEDS: RssFeedConfig[] = [
  // ── Infraestrutura ────────────────────────────────────────────────
  {
    url: "https://developer.nvidia.com/blog/feed",
    source: "NVIDIA Developer Blog",
    topicSlug: "infraestrutura",
    maxItems: 3,
  },
  {
    url: "https://huggingface.co/blog/feed.xml",
    source: "Hugging Face Blog",
    topicSlug: "infraestrutura",
    maxItems: 3,
  },
  {
    url: "https://blog.google/technology/ai/rss/",
    source: "Google AI Blog",
    topicSlug: "infraestrutura",
    maxItems: 3,
  },

  // ── Regulamentação ────────────────────────────────────────────────
  {
    url: "https://futureoflife.org/feed/",
    source: "Future of Life Institute",
    topicSlug: "regulamentacao",
    maxItems: 2,
  },

  // ── Geral — Newsletters / curadas (sem filtro: alta relação sinal/ruído) ──
  {
    url: "https://jack-clark.net/feed/",
    source: "Import AI",
    topicSlug: "geral",
    maxItems: 3,
  },

  // ── Geral — Notícias aplicadas (filtro de relevância ativado) ──────
  {
    url: "https://venturebeat.com/category/ai/feed/",
    source: "VentureBeat AI",
    topicSlug: "geral",
    maxItems: 4,
    relevanceFilter: true,
  },
  {
    url: "https://www.technologyreview.com/topic/artificial-intelligence/feed",
    source: "MIT Technology Review AI",
    topicSlug: "geral",
    maxItems: 3,
    relevanceFilter: true,
  },
  {
    url: "https://techcrunch.com/category/artificial-intelligence/feed/",
    source: "TechCrunch AI",
    topicSlug: "geral",
    maxItems: 4,
    relevanceFilter: true,
  },
  {
    url: "https://the-decoder.com/feed/",
    source: "The Decoder",
    topicSlug: "geral",
    maxItems: 3,
    relevanceFilter: true,
  },

  // ── Brasil ─────────────────────────────────────────────────────────
  {
    url: "https://olhardigital.com.br/feed/",
    source: "Olhar Digital",
    topicSlug: "geral",
    maxItems: 2,
    lang: "pt",
    relevanceFilter: true,
  },
];
