import { RejectionAnalysis } from "@/lib/rejection-risk-engine";
import { AlertTriangle, Shield, ChevronRight, Lightbulb, AlertCircle, CheckCircle } from "lucide-react";

interface RejectionPredictorProps {
  analysis: RejectionAnalysis;
}

const severityConfig = {
  High: {
    bg: "bg-destructive/10",
    border: "border-destructive/30",
    badge: "bg-destructive/15 text-destructive",
    icon: AlertTriangle,
    label: "High Risk",
  },
  Medium: {
    bg: "bg-warning/10",
    border: "border-warning/30",
    badge: "bg-warning/15 text-warning",
    icon: AlertCircle,
    label: "Medium Risk",
  },
  Low: {
    bg: "bg-primary/10",
    border: "border-primary/30",
    badge: "bg-primary/15 text-primary",
    icon: CheckCircle,
    label: "Low Risk",
  },
};

const overallConfig = {
  High: { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/20" },
  Medium: { bg: "bg-warning/10", text: "text-warning", border: "border-warning/20" },
  Low: { bg: "bg-success/10", text: "text-success", border: "border-success/20" },
};

const RejectionPredictor = ({ analysis }: RejectionPredictorProps) => {
  const { rejection_analysis, overall_risk_level, approval_probability } = analysis;
  const overallStyle = overallConfig[overall_risk_level];

  return (
    <div className="rounded-xl border border-border bg-card shadow-card animate-fade-in">
      {/* Header */}
      <div className="border-b border-border p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <h3 className="font-heading text-lg font-semibold text-card-foreground">
              Loan Rejection Risk Analysis
            </h3>
          </div>
          <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${overallStyle.bg} ${overallStyle.text} ${overallStyle.border} border`}>
            {overall_risk_level} Risk
          </span>
        </div>
        <div className={`mt-3 flex items-start gap-2 rounded-lg ${overallStyle.bg} p-3 border ${overallStyle.border}`}>
          <Shield className={`mt-0.5 h-3.5 w-3.5 flex-shrink-0 ${overallStyle.text}`} />
          <p className="text-xs leading-relaxed text-card-foreground">
            <span className={`font-semibold ${overallStyle.text}`}>Approval Outlook: </span>
            {approval_probability}
          </p>
        </div>
      </div>

      {/* Risk Cards */}
      <div className="p-5 space-y-4">
        {rejection_analysis.map((risk, idx) => {
          const config = severityConfig[risk.severity];
          const SeverityIcon = config.icon;

          return (
            <div key={idx} className={`rounded-lg border ${config.border} ${config.bg} p-4`}>
              {/* Risk Header */}
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-card text-xs font-bold text-card-foreground shadow-sm">
                    {idx + 1}
                  </span>
                  <h4 className="text-sm font-semibold text-card-foreground">{risk.risk_title}</h4>
                </div>
                <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${config.badge}`}>
                  <SeverityIcon className="h-2.5 w-2.5" />
                  {config.label}
                </span>
              </div>

              {/* Why It Matters */}
              <div className="mb-3 ml-8">
                <div className="flex items-start gap-1.5">
                  <ChevronRight className="mt-0.5 h-3 w-3 flex-shrink-0 text-muted-foreground" />
                  <p className="text-xs leading-relaxed text-card-foreground">{risk.why_it_matters}</p>
                </div>
              </div>

              {/* How to Improve */}
              <div className="ml-8 rounded-md bg-card/60 p-2.5 border border-border/50">
                <div className="flex items-start gap-1.5">
                  <Lightbulb className="mt-0.5 h-3 w-3 flex-shrink-0 text-primary" />
                  <p className="text-xs leading-relaxed text-primary/90">
                    <span className="font-semibold">How to fix: </span>
                    {risk.how_to_improve}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <div className="border-t border-border px-5 py-3">
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          This analysis is based on the provided financial data and common Indian MSME lending criteria.
          Actual approval decisions depend on the lender's internal policies, CIBIL score, documentation, and business vintage.
          This is not a guarantee of rejection or approval.
        </p>
      </div>
    </div>
  );
};

export default RejectionPredictor;
