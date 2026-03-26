import { buildTrendQuery } from "@/lib/trends/repository";

describe("buildTrendQuery", () => {
  it("always includes deletedAt: null", () => {
    const q = buildTrendQuery({});
    expect(q.deletedAt).toBeNull();
  });

  it("adds topicSlug filter for single topic", () => {
    const q = buildTrendQuery({ topic: "infraestrutura" });
    expect(q.topicSlug).toEqual({ $in: ["infraestrutura"] });
  });

  it("adds topicSlug $in for array of topics", () => {
    const q = buildTrendQuery({ topic: ["infraestrutura", "regulamentacao"] });
    expect(q.topicSlug).toEqual({ $in: ["infraestrutura", "regulamentacao"] });
  });

  it("adds source filter", () => {
    const q = buildTrendQuery({ source: "arXiv" });
    expect(q.source).toBe("arXiv");
  });

  it("adds collectedAt for period 7d", () => {
    const before = Date.now();
    const q = buildTrendQuery({ period: "7d" });
    const after = Date.now();

    const cutoff = (q.collectedAt as { $gte: Date }).$gte;
    expect(cutoff).toBeInstanceOf(Date);

    const expectedMin = new Date(before - 7 * 24 * 60 * 60 * 1000);
    const expectedMax = new Date(after - 7 * 24 * 60 * 60 * 1000);
    expect(cutoff.getTime()).toBeGreaterThanOrEqual(expectedMin.getTime());
    expect(cutoff.getTime()).toBeLessThanOrEqual(expectedMax.getTime() + 100);
  });

  it("combines all three filters", () => {
    const q = buildTrendQuery({
      topic: "geral",
      source: "arXiv",
      period: "30d",
    });
    expect(q.topicSlug).toEqual({ $in: ["geral"] });
    expect(q.source).toBe("arXiv");
    expect(q.collectedAt).toBeDefined();
    expect(q.deletedAt).toBeNull();
  });

  it("does not add topic if not provided", () => {
    const q = buildTrendQuery({ source: "HackerNews" });
    expect(q.topicSlug).toBeUndefined();
  });
});
