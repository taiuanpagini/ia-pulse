export function buildScoringPrompt(title: string, summary: string): string {
  return `Você é um analista de tendências em Inteligência Artificial. Avalie a seguinte tendência usando os 5 critérios abaixo, com valores inteiros de 1 a 5.

Tendência: "${title}"
Resumo: "${summary}"

Critérios:
- maturity: Maturidade Tecnológica (1=pesquisa, 5=em produção)
- applicability: Aplicabilidade Imediata (1=nenhuma, 5=direta)
- competitiveImpact: Impacto Competitivo (1=incremental, 5=disruptivo)
- strategicAlignment: Alinhamento Estratégico (1=baixo, 5=alto)
- adoptionComplexity: Complexidade de Adoção (1=simples, 5=muito complexa — INVERTIDO: 5 é pior)

Responda APENAS com JSON válido, sem texto extra:
{"maturity":N,"applicability":N,"competitiveImpact":N,"strategicAlignment":N,"adoptionComplexity":N}`;
}
