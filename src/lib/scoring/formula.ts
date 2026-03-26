export interface ScoreCriteria {
  maturity: number;
  applicability: number;
  competitiveImpact: number;
  strategicAlignment: number;
  adoptionComplexity: number; // 5=muito complexa; inversão aplicada na fórmula
}

export function calculateScore(criteria: Partial<ScoreCriteria>): number | null {
  const { maturity, applicability, competitiveImpact, strategicAlignment, adoptionComplexity } =
    criteria;

  if (
    maturity == null ||
    applicability == null ||
    competitiveImpact == null ||
    strategicAlignment == null ||
    adoptionComplexity == null
  ) {
    return null;
  }

  const total =
    maturity * 0.2 +
    applicability * 0.3 +
    competitiveImpact * 0.25 +
    strategicAlignment * 0.15 +
    (6 - adoptionComplexity) * 0.1; // inversão: 5=pior → contribui 0.1×1=0.1

  return Math.round(total * 100) / 100;
}
