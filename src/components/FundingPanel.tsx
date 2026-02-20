import { FundingRecommendation as FRType } from "@/lib/financial-calculations";
import { Target, DollarSign, Clock, Lightbulb, Landmark, CheckCircle, Info } from "lucide-react";

interface FundingPanelProps {
  recommendation: FRType;
}

const items = [
  { key: "fundingType" as const, label: "Funding Type", icon: Target },
  { key: "amountRange" as const, label: "Suggested Amount", icon: DollarSign },
  { key: "timing" as const, label: "Best Timing", icon: Clock },
  { key: "reason" as const, label: "Reasoning", icon: Lightbulb },
];

const FundingPanel = ({ recommendation }: FundingPanelProps) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="rounded-xl border border-border bg-card p-6 shadow-card">
        <h3 className="mb-4 font-heading text-lg font-semibold text-card-foreground">
          Funding Recommendation
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map(({ key, label, icon: Icon }) => (
            <div key={key} className="flex gap-3 rounded-lg bg-muted/50 p-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-primary/10">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">{label}</p>
                <p className="text-sm font-medium text-card-foreground">{recommendation[key]}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {recommendation.schemes && recommendation.schemes.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-6 shadow-card">
          <div className="mb-4 flex items-center gap-2">
            <Landmark className="h-5 w-5 text-primary" />
            <h3 className="font-heading text-lg font-semibold text-card-foreground">
              Government Schemes & Funding Options
            </h3>
          </div>
          <p className="mb-4 text-xs text-muted-foreground">
            AI-recommended schemes based on your business profile and financials.
          </p>
          <div className="space-y-3">
            {recommendation.schemes.map((scheme, idx) => (
              <div key={idx} className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                    <Landmark className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <h4 className="text-sm font-semibold text-card-foreground">{scheme.name}</h4>
                </div>
                <div className="ml-9 space-y-1.5">
                  <div className="flex items-start gap-1.5">
                    <Info className="mt-0.5 h-3 w-3 flex-shrink-0 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">{scheme.description}</p>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <CheckCircle className="mt-0.5 h-3 w-3 flex-shrink-0 text-primary" />
                    <p className="text-xs text-card-foreground"><span className="font-medium">Eligibility:</span> {scheme.eligibility}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FundingPanel;
