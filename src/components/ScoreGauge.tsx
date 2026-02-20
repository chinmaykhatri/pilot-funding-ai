interface ScoreGaugeProps {
  score: number;
  reason: string;
}

const ScoreGauge = ({ score, reason }: ScoreGaugeProps) => {
  const getColor = () => {
    if (score >= 70) return "text-success";
    if (score >= 40) return "text-warning";
    return "text-destructive";
  };

  const getBarColor = () => {
    if (score >= 70) return "bg-success";
    if (score >= 40) return "bg-warning";
    return "bg-destructive";
  };

  const getLabel = () => {
    if (score >= 70) return "Strong";
    if (score >= 40) return "Moderate";
    return "Needs Work";
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-card animate-fade-in">
      <h3 className="mb-4 font-heading text-lg font-semibold text-card-foreground">
        Funding Readiness Score
      </h3>
      <div className="flex items-center gap-6">
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
              <span className="text-sm font-medium text-card-foreground">{getLabel()}</span>
              <span className="text-sm text-muted-foreground">{score}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${getBarColor()}`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{reason}</p>
        </div>
      </div>
    </div>
  );
};

export default ScoreGauge;
