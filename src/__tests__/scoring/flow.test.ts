import { calculateScore } from "@/lib/scoring/formula";
import { determineScoredBy } from "@/lib/scoring/origin";
import { ScoreCriteria } from "@/lib/scoring/formula";

const LLM_SUGGESTION: ScoreCriteria = {
  maturity: 3,
  applicability: 4,
  competitiveImpact: 3,
  strategicAlignment: 4,
  adoptionComplexity: 2,
};

describe("Scoring end-to-end flow", () => {
  describe("Manual flow", () => {
    it("scoredBy = 'manual' when no LLM suggestion", () => {
      const result = determineScoredBy(LLM_SUGGESTION, null);
      expect(result).toBe("manual");
    });

    it("score is within [1.00, 5.00] range (NFR-003)", () => {
      const score = calculateScore(LLM_SUGGESTION);
      expect(score).not.toBeNull();
      expect(score!).toBeGreaterThanOrEqual(1.0);
      expect(score!).toBeLessThanOrEqual(5.0);
    });
  });

  describe("LLM flow — analyst accepts suggestion without changes", () => {
    it("scoredBy = 'llm' when submitted equals LLM suggestion", () => {
      const submitted: ScoreCriteria = { ...LLM_SUGGESTION };
      const result = determineScoredBy(submitted, LLM_SUGGESTION);
      expect(result).toBe("llm");
    });
  });

  describe("LLM flow — analyst modifies suggestion", () => {
    it("scoredBy = 'manual' when any field differs from LLM suggestion", () => {
      const submitted: ScoreCriteria = { ...LLM_SUGGESTION, maturity: 4 };
      const result = determineScoredBy(submitted, LLM_SUGGESTION);
      expect(result).toBe("manual");
    });

    it("score recalculates correctly after modification", () => {
      const modified: ScoreCriteria = { ...LLM_SUGGESTION, maturity: 5 };
      const score = calculateScore(modified);
      expect(score).not.toBeNull();
      expect(score).not.toBe(calculateScore(LLM_SUGGESTION));
    });
  });

  describe("Score range validation (NFR-003)", () => {
    it("minimum possible score is 1.00", () => {
      expect(calculateScore({ maturity: 1, applicability: 1, competitiveImpact: 1, strategicAlignment: 1, adoptionComplexity: 5 })).toBe(1.0);
    });

    it("maximum possible score is 5.00", () => {
      expect(calculateScore({ maturity: 5, applicability: 5, competitiveImpact: 5, strategicAlignment: 5, adoptionComplexity: 1 })).toBe(5.0);
    });
  });
});
