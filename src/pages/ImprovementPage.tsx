import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ImprovementRoadmap from "@/components/ImprovementRoadmap";
import { AnalysisResult } from "@/lib/financial-calculations";
import { ArrowLeft, TrendingUp } from "lucide-react";

const ImprovementPage = () => {
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
          <TrendingUp className="h-6 w-6 text-success" />
          <h1 className="font-heading text-2xl font-bold text-foreground">Financial Improvement Roadmap</h1>
        </div>
        <p className="mb-6 text-sm text-muted-foreground">
          Deterministic improvement actions based on your financial data and Indian MSME lending criteria. Address these to strengthen your loan application.
        </p>
        <ImprovementRoadmap roadmap={results.improvements} />
      </div>
    </div>
  );
};

export default ImprovementPage;
