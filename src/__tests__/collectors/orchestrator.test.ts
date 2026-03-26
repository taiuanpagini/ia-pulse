import { CollectedItem, CollectorResult } from "@/lib/collectors/types";

describe("Orchestrator isolation logic", () => {
  it("Promise.allSettled should continue when one collector fails", async () => {
    const successCollector = async (): Promise<{ items: CollectedItem[]; result: CollectorResult }> => ({
      items: [
        {
          title: "Test",
          summary: "Summary",
          url: "https://example.com/1",
          source: "TestSource",
          topicSlug: "geral",
          collectedAt: new Date(),
        },
      ],
      result: { source: "TestSource", status: "success", itemsCollected: 1, itemsSkipped: 0 },
    });

    const failingCollector = async (): Promise<{ items: CollectedItem[]; result: CollectorResult }> => {
      throw new Error("Network error");
    };

    const results = await Promise.allSettled([successCollector(), failingCollector()]);

    expect(results[0].status).toBe("fulfilled");
    expect(results[1].status).toBe("rejected");

    const successful = results.filter((r) => r.status === "fulfilled");
    expect(successful).toHaveLength(1);
  });

  it("should count successful vs failed collectors", async () => {
    const collectors = [
      Promise.resolve({ items: [], result: { source: "A", status: "success" as const, itemsCollected: 5, itemsSkipped: 0 } }),
      Promise.reject(new Error("fail")),
      Promise.resolve({ items: [], result: { source: "C", status: "success" as const, itemsCollected: 3, itemsSkipped: 0 } }),
    ];

    const settled = await Promise.allSettled(collectors);
    const ok = settled.filter((r) => r.status === "fulfilled").length;
    const failed = settled.filter((r) => r.status === "rejected").length;

    expect(ok).toBe(2);
    expect(failed).toBe(1);
  });
});
