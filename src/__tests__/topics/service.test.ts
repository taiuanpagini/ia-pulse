describe("Topic slug generation", () => {
  function generateSlug(name: string): string {
    return name
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  it("normalizes accents", () => {
    expect(generateSlug("Ação")).toBe("acao");
  });

  it("converts spaces to hyphens", () => {
    expect(generateSlug("IA Generativa")).toBe("ia-generativa");
  });

  it("lowercases everything", () => {
    expect(generateSlug("Machine Learning")).toBe("machine-learning");
  });

  it("removes special characters", () => {
    expect(generateSlug("C++ & Python")).toBe("c-python");
  });

  it("collapses multiple hyphens", () => {
    expect(generateSlug("foo  bar  baz")).toBe("foo-bar-baz");
  });
});

describe("Topic color auto-assignment", () => {
  const TOPIC_COLOR_PALETTE = [
    "blue", "emerald", "violet", "amber", "rose",
    "cyan", "orange", "teal", "pink", "indigo",
  ] as const;

  function assignColor(count: number): string {
    return TOPIC_COLOR_PALETTE[count % TOPIC_COLOR_PALETTE.length];
  }

  it("first topic gets blue", () => {
    expect(assignColor(0)).toBe("blue");
  });

  it("second topic gets emerald", () => {
    expect(assignColor(1)).toBe("emerald");
  });

  it("11th topic wraps back to blue", () => {
    expect(assignColor(10)).toBe("blue");
  });

  it("cycles through all 10 colors", () => {
    const colors = Array.from({ length: 10 }, (_, i) => assignColor(i));
    expect(new Set(colors).size).toBe(10);
  });
});
