import { calculateScore, ScoreCriteria } from "@/lib/scoring/formula";

const ALL_MAX: ScoreCriteria = {
  maturity: 5,
  applicability: 5,
  competitiveImpact: 5,
  strategicAlignment: 5,
  adoptionComplexity: 5, // inverted: contributes 0.1×(6-5)=0.1
};

const ALL_MIN: ScoreCriteria = {
  maturity: 1,
  applicability: 1,
  competitiveImpact: 1,
  strategicAlignment: 1,
  adoptionComplexity: 1, // inverted: contributes 0.1×(6-1)=0.5
};

const ALL_BEST: ScoreCriteria = {
  maturity: 5,
  applicability: 5,
  competitiveImpact: 5,
  strategicAlignment: 5,
  adoptionComplexity: 1, // simples (best): contributes 0.1×5=0.5
};

describe("calculateScore", () => {
  it("returns null when any criterion is missing", () => {
    expect(calculateScore({})).toBeNull();
    expect(calculateScore({ maturity: 5 })).toBeNull();
    expect(calculateScore({ maturity: 5, applicability: 4, competitiveImpact: 3, strategicAlignment: 2 })).toBeNull();
  });

  it("returns 4.60 when all criteria = 5 (complexity inverted)", () => {
    // 5×0.20 + 5×0.30 + 5×0.25 + 5×0.15 + (6-5)×0.10 = 1+1.5+1.25+0.75+0.1 = 4.60
    expect(calculateScore(ALL_MAX)).toBe(4.6);
  });

  it("returns 1.40 when all criteria = 1 (complexity inverted)", () => {
    // 1×0.20 + 1×0.30 + 1×0.25 + 1×0.15 + (6-1)×0.10 = 0.2+0.3+0.25+0.15+0.5 = 1.40
    expect(calculateScore(ALL_MIN)).toBe(1.4);
  });

  it("returns 5.00 for maximum score (complexity=1=simple=best)", () => {
    // 5×0.20 + 5×0.30 + 5×0.25 + 5×0.15 + (6-1)×0.10 = 1+1.5+1.25+0.75+0.5 = 5.00
    expect(calculateScore(ALL_BEST)).toBe(5.0);
  });

  it("rounds to 2 decimal places", () => {
    const result = calculateScore({
      maturity: 3,
      applicability: 4,
      competitiveImpact: 2,
      strategicAlignment: 5,
      adoptionComplexity: 3,
    });
    // 3×0.20 + 4×0.30 + 2×0.25 + 5×0.15 + (6-3)×0.10
    // = 0.6 + 1.2 + 0.5 + 0.75 + 0.3 = 3.35
    expect(result).toBe(3.35);
  });

  it("complexity=5 contributes 0.1×1=0.10 (worst)", () => {
    const result = calculateScore({
      maturity: 5,
      applicability: 5,
      competitiveImpact: 5,
      strategicAlignment: 5,
      adoptionComplexity: 5,
    });
    expect(result).toBe(4.6); // not 5.0
  });

  it("complexity=1 contributes 0.1×5=0.50 (best)", () => {
    expect(calculateScore(ALL_BEST)).toBe(5.0);
  });
});
