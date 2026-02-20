import { FundingReadiness } from "@/lib/financial-calculations";

interface ScoreGaugeProps {
  readiness: FundingReadiness;
}

const ScoreGauge = ({ readiness }: ScoreGaugeProps) => {
  const { readiness_score: score, classification, breakdown, professional_explanation } = readiness;

  const getColor = () => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    if (score >= 40) return "text-orange-400";
    return "text-destructive";
  };

  const getBarColor = () => {
    if (score >= 80) return "bg-success";
    if (score >= 60) return "bg-warning";
    if (score >= 40) return "bg-orange-400";
    return "bg-destructive";
  };

  const getClassificationColor = () => {
    if (classification === "Strong") return "text-success bg-success/10 border-success/30";
    if (classification === "Moderate") return "text-warning bg-warning/10 border-warning/30";
    if (classification === "Weak") return "text-orange-400 bg-orange-400/10 border-orange-400/30";
    return "text-destructive bg-destructive/10 border-destructive/30";
  };

  const getFactorBarColor = (points: number, max: number) => {
    const pct = points / max;
    if (pct >= 0.8) return "bg-success";
    if (pct >= 0.5) return "bg-warning";
    if (pct >= 0.3) return "bg-orange-400";
    return "bg-destructive";
  };

  const factors = [
    { label: "Runway", key: "runway" as const, icon: "🛤️" },
    { label: "Cash Flow", key: "cashflow" as const, icon: "💰" },
    { label: "Debt Ratio", key: "debt" as const, icon: "📊" },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-card animate-fade-in">
      <h3 className="mb-4 font-heading text-lg font-semibold text-card-foreground">
        Funding Readiness Score
      </h3>

      {/* Score Gauge + Classification */}
      <div className="flex items-center gap-6 mb-5">
        <div className="relative flex h-28 w-28 flex-shrink-0 items-center justify-center">
          <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(score / 100) * 264} 264`}
              className={`${getColor()} transition-all duration-1000 ease-out`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`font-heading text-2xl font-bold ${getColor()}`}>{score}</span>
            <span className="text-[10px] text-muted-foreground">/100</span>
          </div>
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className={`inline-block rounded-full border px-3 py-0.5 text-xs font-semibold ${getClassificationColor()}`}>
                {classification}
              </span>
              <span className="text-sm text-muted-foreground">{score}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${getBarColor()}`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{professional_explanation}</p>
        </div>
      </div>

      {/* Factor Breakdown */}
      <div className="space-y-3 border-t border-border pt-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Score Breakdown</h4>
        {factors.map(({ label, key, icon }) => {
          const factor = breakdown[key];
          return (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-sm font-medium text-card-foreground">
                  <span>{icon}</span> {label}
                </span>
                <span className="text-sm font-semibold text-card-foreground">
                  {factor.points}<span className="text-muted-foreground font-normal">/{factor.max}</span>
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${getFactorBarColor(factor.points, factor.max)}`}
                  style={{ width: `${(factor.points / factor.max) * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{factor.reason}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScoreGauge;
