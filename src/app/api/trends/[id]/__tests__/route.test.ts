import { NextRequest } from "next/server";

jest.mock("@/lib/trends/service", () => ({
  getTrendDetail: jest.fn(),
}));

import { getTrendDetail } from "@/lib/trends/service";
import { GET } from "../route";

const mockedGetTrendDetail = getTrendDetail as jest.MockedFunction<typeof getTrendDetail>;

function makeRequest(id: string) {
  return new NextRequest(`http://localhost/api/trends/${id}`);
}

const baseTrend = {
  id: "507f1f77bcf86cd799439011",
  title: "Test Trend",
  summary: "A summary",
  url: "https://example.com",
  source: "arxiv",
  topicSlug: "infraestrutura",
  topicName: "Infraestrutura",
  topicColor: "blue",
  collectedAt: "2026-03-25T07:00:00.000Z",
};

describe("GET /api/trends/[id]", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 200 with trend data when found", async () => {
    mockedGetTrendDetail.mockResolvedValueOnce({ ...baseTrend });

    const res = await GET(makeRequest(baseTrend.id), {
      params: Promise.resolve({ id: baseTrend.id }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.id).toBe(baseTrend.id);
    expect(body.data.topicColor).toBe("blue");
    expect(body.data.topicName).toBe("Infraestrutura");
  });

  it("returns 404 when trend is not found", async () => {
    mockedGetTrendDetail.mockResolvedValueOnce(null);

    const res = await GET(makeRequest("507f1f77bcf86cd799439011"), {
      params: Promise.resolve({ id: "507f1f77bcf86cd799439011" }),
    });

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error.code).toBe("TREND_NOT_FOUND");
  });

  it("returns 404 for non-ObjectId string (service returns null)", async () => {
    mockedGetTrendDetail.mockResolvedValueOnce(null);

    const res = await GET(makeRequest("abc"), {
      params: Promise.resolve({ id: "abc" }),
    });

    expect(res.status).toBe(404);
  });

  it("includes level in score when trend has score", async () => {
    const trendWithScore = {
      ...baseTrend,
      score: {
        maturity: 4,
        applicability: 4,
        competitiveImpact: 4,
        strategicAlignment: 4,
        adoptionComplexity: 2,
        total: 4.1,
        level: "high" as const,
        scoredBy: "manual" as const,
        scoredAt: "2026-03-25T08:00:00.000Z",
      },
    };
    mockedGetTrendDetail.mockResolvedValueOnce(trendWithScore);

    const res = await GET(makeRequest(baseTrend.id), {
      params: Promise.resolve({ id: baseTrend.id }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.score.level).toBe("high");
  });

  it("score is undefined when trend has no score", async () => {
    mockedGetTrendDetail.mockResolvedValueOnce({ ...baseTrend });

    const res = await GET(makeRequest(baseTrend.id), {
      params: Promise.resolve({ id: baseTrend.id }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.score).toBeUndefined();
  });
});
