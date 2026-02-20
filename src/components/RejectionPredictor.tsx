import { AlertTriangle } from "lucide-react";

interface RejectionPredictorProps {
  risks: string[];
}

const RejectionPredictor = ({ risks }: RejectionPredictorProps) => {
  return (
    <div className="rounded-xl border border-destructive/20 bg-card p-6 shadow-card animate-fade-in">
      <div className="mb-4 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-destructive" />
        <h3 className="font-heading text-lg font-semibold text-card-foreground">
          Loan Rejection Risks
        </h3>
      </div>
      <div className="space-y-2">
        {risks.map((risk, i) => (
          <div key={i} className="flex gap-3 rounded-lg bg-destructive/5 p-3">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-destructive/10 text-xs font-bold text-destructive">
              {i + 1}
            </span>
            <p className="text-sm text-card-foreground">{risk}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RejectionPredictor;
