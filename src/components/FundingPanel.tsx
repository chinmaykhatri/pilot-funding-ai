import { SmartFundingRecommendation } from "@/lib/funding-recommendation";
import { Target, DollarSign, Clock, Lightbulb, Landmark, CheckCircle, ExternalLink, Info, Shield } from "lucide-react";

interface FundingPanelProps {
  recommendation: SmartFundingRecommendation;
}

const FundingPanel = ({ recommendation }: FundingPanelProps) => {
  const { primary_recommendation, funding_options } = recommendation;

  const primaryItems = [
    { label: "Funding Type", value: primary_recommendation.funding_type, icon: Target },
    { label: "Suggested Amount", value: primary_recommendation.suggested_amount_range, icon: DollarSign },
    { label: "Best Timing", value: primary_recommendation.best_timing, icon: Clock },
    { label: "Reasoning", value: primary_recommendation.reason, icon: Lightbulb },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Primary Recommendation */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-card">
        <h3 className="mb-4 font-heading text-lg font-semibold text-card-foreground">
          Smart Funding Recommendation
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {primaryItems.map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex gap-3 rounded-lg bg-muted/50 p-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-primary/10">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">{label}</p>
                <p className="text-sm font-medium text-card-foreground">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Funding Options */}
      {funding_options && funding_options.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-6 shadow-card">
          <div className="mb-4 flex items-center gap-2">
            <Landmark className="h-5 w-5 text-primary" />
            <h3 className="font-heading text-lg font-semibold text-card-foreground">
              Recommended Funding Schemes
            </h3>
          </div>
          <p className="mb-4 text-xs text-muted-foreground">
            Real, verified Indian MSME schemes matched to your financial profile. Links lead to official government / bank websites.
          </p>
          <div className="space-y-4">
            {funding_options.map((option, idx) => (
              <div key={idx} className="rounded-lg border border-border bg-muted/30 p-4">
                {/* Header */}
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                      <Landmark className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-card-foreground">{option.name}</h4>
                      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{option.type}</span>
                    </div>
                  </div>
                  {option.official_link && (
                    <a
                      href={option.official_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 rounded-md border border-primary/20 bg-primary/5 px-2.5 py-1 text-[10px] font-semibold text-primary hover:bg-primary/10 transition-colors"
                    >
                      Official Site <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  )}
                </div>

                {/* Details */}
                <div className="ml-9 space-y-2">
                  <div className="flex items-start gap-1.5">
                    <DollarSign className="mt-0.5 h-3 w-3 flex-shrink-0 text-success" />
                    <p className="text-xs text-card-foreground">
                      <span className="font-medium">Amount:</span> {option.amount_range}
                    </p>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <Info className="mt-0.5 h-3 w-3 flex-shrink-0 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">{option.why_suitable}</p>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <CheckCircle className="mt-0.5 h-3 w-3 flex-shrink-0 text-primary" />
                    <p className="text-xs text-card-foreground">
                      <span className="font-medium">Eligibility:</span> {option.basic_eligibility}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-warning/20 bg-warning/5 p-3">
            <Shield className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-warning" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              <span className="font-medium text-warning">Disclaimer:</span> These recommendations are based on publicly available information and your financial profile.
              Actual eligibility and approval depend on the lending institution's assessment. We do not guarantee loan approval.
              Please verify all details on the official websites before applying.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FundingPanel;
