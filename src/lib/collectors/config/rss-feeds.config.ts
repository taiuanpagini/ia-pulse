export interface RssFeedConfig {
  url: string;
  source: string;
  topicSlug: string;
  maxItems?: number; // default: 6
  lang?: "pt" | "en";
}

export const RSS_FEEDS: RssFeedConfig[] = [
  // Infraestrutura
  {
    url: "https://developer.nvidia.com/blog/feed",
    source: "NVIDIA Developer Blog",
    topicSlug: "infraestrutura",
  },
  {
    url: "https://huggingface.co/blog/feed.xml",
    source: "Hugging Face Blog",
    topicSlug: "infraestrutura",
  },
  {
    url: "https://ai.googleblog.com/feeds/posts/default",
    source: "Google AI Blog",
    topicSlug: "infraestrutura",
  },
  // Regulamentação
  {
    url: "https://eur-lex.europa.eu/RSSFUL.do?ihmlang=en&mtype=1&type=&sector=&domain=IA&DTS_DOM=AI",
    source: "EUR-Lex AI Act",
    topicSlug: "regulamentacao",
  },
  {
    url: "https://www.gov.br/anpd/pt-br/assuntos/noticias/RSS",
    source: "ANPD",
    topicSlug: "regulamentacao",
  },
  {
    url: "https://www.nist.gov/artificial-intelligence/rss.xml",
    source: "NIST AI RMF",
    topicSlug: "regulamentacao",
  },
  {
    url: "https://futureoflife.org/feed/",
    source: "Future of Life Institute",
    topicSlug: "regulamentacao",
  },
  {
    url: "https://ainowinstitute.org/feed",
    source: "AI Now Institute",
    topicSlug: "regulamentacao",
  },
  {
    url: "https://hai.stanford.edu/news/rss.xml",
    source: "Stanford HAI",
    topicSlug: "regulamentacao",
  },
  // Geral — Internacional
  {
    url: "https://www.deeplearning.ai/the-batch/feed/",
    source: "The Batch",
    topicSlug: "geral",
    maxItems: 5,
  },
  {
    url: "https://jack-clark.net/feed/",
    source: "Import AI",
    topicSlug: "geral",
    maxItems: 4,
  },
  {
    url: "https://venturebeat.com/category/ai/feed/",
    source: "VentureBeat AI",
    topicSlug: "geral",
    maxItems: 6,
  },
  {
    url: "https://www.technologyreview.com/topic/artificial-intelligence/feed",
    source: "MIT Technology Review AI",
    topicSlug: "geral",
    maxItems: 5,
  },

  // Brasil — fontes em Português
  {
    url: "https://olhardigital.com.br/feed/",
    source: "Olhar Digital",
    topicSlug: "geral",
    maxItems: 5,
    lang: "pt",
  },
  {
    url: "https://canaltech.com.br/rss.xml",
    source: "Canaltech",
    topicSlug: "geral",
    maxItems: 5,
    lang: "pt",
  },
  {
    url: "https://www.gov.br/mcti/pt-br/acompanhe-o-mcti/noticias/RSS",
    source: "MCTI Brasil",
    topicSlug: "regulamentacao",
    maxItems: 4,
    lang: "pt",
  },
];
