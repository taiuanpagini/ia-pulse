import { getScoreLevel } from "@/lib/scoring/levels";

describe("getScoreLevel", () => {
  it("returns 'low' for score < 2.50", () => {
    expect(getScoreLevel(1.0).level).toBe("low");
    expect(getScoreLevel(2.0).level).toBe("low");
    expect(getScoreLevel(2.49).level).toBe("low");
  });

  it("returns 'medium' for 2.50 <= score < 3.50", () => {
    expect(getScoreLevel(2.5).level).toBe("medium");
    expect(getScoreLevel(3.0).level).toBe("medium");
    expect(getScoreLevel(3.49).level).toBe("medium");
  });

  it("returns 'high' for 3.50 <= score < 4.50", () => {
    expect(getScoreLevel(3.5).level).toBe("high");
    expect(getScoreLevel(4.0).level).toBe("high");
    expect(getScoreLevel(4.49).level).toBe("high");
  });

  it("returns 'critical' for score >= 4.50", () => {
    expect(getScoreLevel(4.5).level).toBe("critical");
    expect(getScoreLevel(5.0).level).toBe("critical");
  });

  it("has correct labels", () => {
    expect(getScoreLevel(1.0).label).toBe("Baixo");
    expect(getScoreLevel(3.0).label).toBe("Médio");
    expect(getScoreLevel(4.0).label).toBe("Alto");
    expect(getScoreLevel(5.0).label).toBe("Crítico");
  });
});
