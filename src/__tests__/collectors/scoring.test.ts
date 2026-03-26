import { CollectedItem, CollectorResult } from "@/lib/collectors/types";

describe("CollectorResult types", () => {
  it("should accept valid success result", () => {
    const result: CollectorResult = {
      source: "arXiv",
      status: "success",
      itemsCollected: 10,
      itemsSkipped: 2,
    };
    expect(result.status).toBe("success");
  });

  it("should accept error result with error field", () => {
    const result: CollectorResult = {
      source: "Reddit",
      status: "error",
      itemsCollected: 0,
      itemsSkipped: 0,
      error: "HTTP 429",
    };
    expect(result.error).toBeDefined();
  });

  it("should accept valid CollectedItem", () => {
    const item: CollectedItem = {
      title: "Test paper",
      summary: "A summary",
      url: "https://arxiv.org/abs/1234.5678",
      source: "arXiv",
      topicSlug: "infraestrutura",
      collectedAt: new Date(),
    };
    expect(item.topicSlug).toBe("infraestrutura");
  });
});
