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
    url: "https://algorithmwatch.org/en/feed/",
    source: "AlgorithmWatch",
    topicSlug: "regulamentacao",
    maxItems: 3,
    relevanceFilter: true,
  },

  // ── Infraestrutura — Notícias de mercado ─────────────────────────
  {
    url: "https://venturebeat.com/category/ai/feed/",
    source: "VentureBeat AI",
    topicSlug: "infraestrutura",
    maxItems: 4,
    relevanceFilter: true,
  },
  {
    url: "https://the-decoder.com/feed/",
    source: "The Decoder",
    topicSlug: "infraestrutura",
    maxItems: 3,
    relevanceFilter: true,
  },
];
