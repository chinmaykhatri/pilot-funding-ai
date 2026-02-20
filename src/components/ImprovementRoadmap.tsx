import { TrendingUp } from "lucide-react";

interface ImprovementRoadmapProps {
  steps: string[];
}

const ImprovementRoadmap = ({ steps }: ImprovementRoadmapProps) => {
  return (
    <div className="rounded-xl border border-success/20 bg-card p-6 shadow-card animate-fade-in">
      <div className="mb-4 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-success" />
        <h3 className="font-heading text-lg font-semibold text-card-foreground">
          Improvement Roadmap
        </h3>
      </div>
      <div className="space-y-2">
        {steps.map((step, i) => (
          <div key={i} className="flex gap-3 rounded-lg bg-success/5 p-3">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-success/10 text-xs font-bold text-success">
              {i + 1}
            </span>
            <p className="text-sm text-card-foreground">{step}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImprovementRoadmap;
