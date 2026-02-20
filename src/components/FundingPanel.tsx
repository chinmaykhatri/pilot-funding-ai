import { FundingRecommendation as FRType } from "@/lib/financial-calculations";
import { Target, DollarSign, Clock, Lightbulb } from "lucide-react";

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
    <div className="rounded-xl border border-border bg-card p-6 shadow-card animate-fade-in">
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
  );
};

export default FundingPanel;
