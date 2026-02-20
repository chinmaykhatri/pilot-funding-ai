import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Trash2, Eye, Clock, TrendingUp, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AnalysisRow {
  id: string;
  revenue: number;
  expenses: number;
  cash: number;
  debt: number;
  goal: string;
  burn_rate: number;
  runway_months: string;
  debt_ratio: number;
  risk_level: string;
  readiness_score: number;
  ai_summary: string | null;
  readiness_reason: string | null;
  recommendation: any;
  loan_application: any;
  rejection_risks: any;
  improvements: any;
  created_at: string;
}

const History = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [analyses, setAnalyses] = useState<AnalysisRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchAnalyses();
  }, [user]);

  const fetchAnalyses = async () => {
    const { data, error } = await supabase
      .from("financial_analyses")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error(error);
    } else {
      setAnalyses(data || []);
    }
    setLoading(false);
  };

  const handleView = (row: AnalysisRow) => {
    const runwayMonths = row.runway_months === "stable" ? "stable" : Number(row.runway_months);
    const results = {
      metrics: {
        burnRate: Number(row.burn_rate),
        runwayMonths,
        debtRatio: Number(row.debt_ratio),
        riskLevel: row.risk_level,
      },
      readiness: {
        score: row.readiness_score,
        reason: row.readiness_reason || "",
      },
      recommendation: row.recommendation,
      loanApplication: row.loan_application,
      rejectionRisks: row.rejection_risks,
      improvements: row.improvements,
      aiSummary: row.ai_summary || "",
    };
    sessionStorage.setItem("finpilot-results", JSON.stringify(results));
    navigate("/dashboard");
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("financial_analyses").delete().eq("id", id);
    if (error) {
      toast({ title: "Failed to delete", variant: "destructive" });
    } else {
      setAnalyses((prev) => prev.filter((a) => a.id !== id));
      toast({ title: "Analysis deleted" });
    }
  };

  const riskColor = (level: string) => {
    if (level === "Low") return "text-success";
    if (level === "Moderate") return "text-warning";
    return "text-destructive";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="mb-2 font-heading text-2xl font-bold text-foreground">Analysis History</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          View and revisit your past financial analyses
        </p>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
          </div>
        ) : analyses.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center shadow-card">
            <Clock className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
            <h3 className="mb-1 font-heading text-lg font-semibold text-card-foreground">No analyses yet</h3>
            <p className="mb-4 text-sm text-muted-foreground">Run your first AI financial analysis to see results here.</p>
            <Button onClick={() => navigate("/analyze")} className="gradient-primary text-primary-foreground shadow-primary">
              Start Analysis
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {analyses.map((a) => (
              <div
                key={a.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border bg-card p-5 shadow-card transition-all hover:shadow-card-hover"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-heading font-semibold text-card-foreground">{a.goal}</span>
                    <span className={`text-xs font-medium ${riskColor(a.risk_level)}`}>
                      {a.risk_level} Risk
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span>Revenue: ₹{Number(a.revenue).toLocaleString()}</span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" /> Score: {a.readiness_score}/100
                    </span>
                    <span>{new Date(a.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleView(a)} className="gap-1.5">
                    <Eye className="h-3.5 w-3.5" /> View
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(a.id)} className="gap-1.5 text-destructive hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
