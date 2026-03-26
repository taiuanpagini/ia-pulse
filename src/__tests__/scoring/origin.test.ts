import { determineScoredBy } from "@/lib/scoring/origin";
import { ScoreCriteria } from "@/lib/scoring/formula";

const BASE: ScoreCriteria = {
  maturity: 3,
  applicability: 4,
  competitiveImpact: 3,
  strategicAlignment: 4,
  adoptionComplexity: 2,
};

describe("determineScoredBy", () => {
  it("returns 'manual' when llmSuggestion is null", () => {
    expect(determineScoredBy(BASE, null)).toBe("manual");
  });

  it("returns 'llm' when submitted equals llmSuggestion exactly", () => {
    expect(determineScoredBy(BASE, { ...BASE })).toBe("llm");
  });

  it("returns 'manual' when any single field differs", () => {
    expect(determineScoredBy(BASE, { ...BASE, maturity: 4 })).toBe("manual");
    expect(determineScoredBy(BASE, { ...BASE, applicability: 2 })).toBe("manual");
    expect(determineScoredBy(BASE, { ...BASE, adoptionComplexity: 5 })).toBe("manual");
  });

  it("returns 'manual' when multiple fields differ", () => {
    expect(
      determineScoredBy(BASE, { ...BASE, maturity: 1, competitiveImpact: 5 })
    ).toBe("manual");
  });
});
