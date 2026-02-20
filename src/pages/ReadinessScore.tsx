import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ScoreGauge from "@/components/ScoreGauge";
import { AnalysisResult } from "@/lib/financial-calculations";
import { ArrowLeft, Target } from "lucide-react";

const ReadinessScore = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("finpilot-results");
    if (!stored) { navigate("/analyze"); return; }
    try { setResults(JSON.parse(stored)); } catch { navigate("/analyze"); }
  }, [navigate]);

  if (!results) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-2xl px-6 py-8">
        <button onClick={() => navigate("/dashboard")} className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
        </button>
        <div className="mb-6 flex items-center gap-2">
          <Target className="h-6 w-6 text-success" />
          <h1 className="font-heading text-2xl font-bold text-foreground">Funding Readiness Score</h1>
        </div>
        <p className="mb-6 text-sm text-muted-foreground">
          Calculated using: Runway Factor (40%) + Cash Flow Health (30%) + Debt Ratio (30%)
        </p>
        <ScoreGauge score={results.readiness.score} reason={results.readiness.reason} />
      </div>
    </div>
  );
};

export default ReadinessScore;
