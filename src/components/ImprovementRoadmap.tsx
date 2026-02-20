import { FinancialRoadmap } from "@/lib/improvement-roadmap-engine";
import { TrendingUp, Target, ChevronRight, Zap, ArrowUpRight } from "lucide-react";

interface ImprovementRoadmapProps {
  roadmap: FinancialRoadmap;
}

const priorityConfig = {
  High: {
    bg: "bg-destructive/8",
    border: "border-destructive/25",
    badge: "bg-destructive/12 text-destructive border-destructive/20",
    dot: "bg-destructive",
  },
  Medium: {
    bg: "bg-warning/8",
    border: "border-warning/25",
    badge: "bg-warning/12 text-warning border-warning/20",
    dot: "bg-warning",
  },
  Low: {
    bg: "bg-success/8",
    border: "border-success/25",
    badge: "bg-success/12 text-success border-success/20",
    dot: "bg-success",
  },
};

const ImprovementRoadmap = ({ roadmap }: ImprovementRoadmapProps) => {
  const { financial_roadmap, readiness_summary } = roadmap;

  return (
    <div className="rounded-xl border border-border bg-card shadow-card animate-fade-in">
      {/* Header */}
      <div className="border-b border-border p-5">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-success" />
          <h3 className="font-heading text-lg font-semibold text-card-foreground">
            Financial Improvement Roadmap
          </h3>
        </div>
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-primary/5 p-3 border border-primary/15">
          <Target className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary" />
          <p className="text-xs leading-relaxed text-card-foreground">
            <span className="font-semibold text-primary">Current Position: </span>
            {readiness_summary}
          </p>
        </div>
      </div>

      {/* Roadmap Actions */}
      <div className="p-5 space-y-4">
        {financial_roadmap.map((action, idx) => {
          const config = priorityConfig[action.priority];

          return (
            <div key={idx} className={`rounded-lg border ${config.border} ${config.bg} p-4`}>
              {/* Action Header */}
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-card text-xs font-bold text-card-foreground shadow-sm">
                    {idx + 1}
                  </span>
                  <h4 className="text-sm font-semibold text-card-foreground">{action.action_title}</h4>
                </div>
                <span className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${config.badge}`}>
                  {action.priority}
                </span>
              </div>

              {/* What to Do */}
              <div className="mb-3 ml-8">
                <div className="flex items-start gap-1.5">
                  <Zap className="mt-0.5 h-3 w-3 flex-shrink-0 text-primary" />
                  <div>
                    <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">What to do</p>
                    <p className="text-xs leading-relaxed text-card-foreground">{action.what_to_do}</p>
                  </div>
                </div>
              </div>

              {/* Why It Matters */}
              <div className="mb-3 ml-8">
                <div className="flex items-start gap-1.5">
                  <ChevronRight className="mt-0.5 h-3 w-3 flex-shrink-0 text-muted-foreground" />
                  <div>
                    <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Why it matters</p>
                    <p className="text-xs leading-relaxed text-card-foreground/80">{action.why_it_matters}</p>
                  </div>
                </div>
              </div>

              {/* Expected Impact */}
              <div className="ml-8 rounded-md bg-card/60 p-2.5 border border-border/50">
                <div className="flex items-start gap-1.5">
                  <ArrowUpRight className="mt-0.5 h-3 w-3 flex-shrink-0 text-success" />
                  <div>
                    <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-success">Expected Impact</p>
                    <p className="text-xs leading-relaxed text-card-foreground">{action.expected_impact}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <div className="border-t border-border px-5 py-3">
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          This roadmap is based on provided financial data and general Indian MSME lending practices.
          Actual improvements required may vary by lender. Consult a CA or financial advisor for personalized guidance.
        </p>
      </div>
    </div>
  );
};

export default ImprovementRoadmap;
