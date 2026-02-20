import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import MetricCard from "@/components/MetricCard";
import ScoreGauge from "@/components/ScoreGauge";
import FundingPanel from "@/components/FundingPanel";
import LoanApplicationView from "@/components/LoanApplicationView";
import RejectionPredictor from "@/components/RejectionPredictor";
import ImprovementRoadmap from "@/components/ImprovementRoadmap";
import { Button } from "@/components/ui/button";
import { AnalysisResult } from "@/lib/financial-calculations";
import { Flame, Clock, AlertTriangle, Activity, ArrowLeft, FileText, Sparkles } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [showLoan, setShowLoan] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("finpilot-results");
    if (!stored) {
      navigate("/");
      return;
    }
    try {
      setResults(JSON.parse(stored));
    } catch {
      navigate("/");
    }
  }, [navigate]);

  if (!results) return null;

  const { metrics, readiness, recommendation, loanApplication, rejectionRisks, improvements, aiSummary } = results;

  const riskVariant = metrics.riskLevel === "Low" ? "success" : metrics.riskLevel === "Moderate" ? "warning" : "destructive";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <button
              onClick={() => navigate("/")}
              className="mb-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Input
            </button>
            <h1 className="font-heading text-2xl font-bold text-foreground">Financial Dashboard</h1>
            <p className="text-sm text-muted-foreground">AI-generated analysis of your business financials</p>
          </div>
          <Button
            onClick={() => setShowLoan(!showLoan)}
            className="gap-2 gradient-primary text-primary-foreground shadow-primary"
          >
            <FileText className="h-4 w-4" />
            {showLoan ? "Hide Loan Application" : "Generate Loan Application"}
          </Button>
        </div>

        {/* AI Summary */}
        <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-5 animate-fade-in">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">AI Summary</span>
          </div>
          <p className="text-sm leading-relaxed text-foreground">{aiSummary}</p>
        </div>

        {/* Metric Cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Burn Rate"
            value={metrics.burnRate === 0 ? "₹0" : `₹${metrics.burnRate.toLocaleString()}`}
            subtitle="Monthly cash burn"
            icon={<Flame className="h-5 w-5" />}
            variant={metrics.burnRate === 0 ? "success" : "warning"}
          />
          <MetricCard
            title="Runway"
            value={metrics.runwayMonths === "stable" ? "Stable" : `${metrics.runwayMonths} months`}
            subtitle="Cash runway remaining"
            icon={<Clock className="h-5 w-5" />}
            variant={metrics.runwayMonths === "stable" || (typeof metrics.runwayMonths === "number" && metrics.runwayMonths > 12) ? "success" : "warning"}
          />
          <MetricCard
            title="Risk Level"
            value={metrics.riskLevel}
            subtitle="Overall risk assessment"
            icon={<AlertTriangle className="h-5 w-5" />}
            variant={riskVariant}
          />
          <MetricCard
            title="Debt Ratio"
            value={metrics.debtRatio.toFixed(2)}
            subtitle="Debt to annual revenue"
            icon={<Activity className="h-5 w-5" />}
            variant={metrics.debtRatio < 0.5 ? "success" : "destructive"}
          />
        </div>

        {/* Score + Recommendation */}
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          <ScoreGauge score={readiness.score} reason={readiness.reason} />
          <FundingPanel recommendation={recommendation} />
        </div>

        {/* Loan Application */}
        {showLoan && (
          <div className="mb-6">
            <LoanApplicationView application={loanApplication} />
          </div>
        )}

        {/* Risks + Improvements */}
        <div className="grid gap-6 lg:grid-cols-2">
          <RejectionPredictor risks={rejectionRisks.risks} />
          <ImprovementRoadmap steps={improvements.steps} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
