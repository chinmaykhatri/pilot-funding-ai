import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { FinancialData, calculateMetrics, calculateReadinessScore } from "@/lib/financial-calculations";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const fundingGoals = [
  "Working Capital",
  "Equipment Purchase",
  "Business Expansion",
  "Inventory Financing",
  "Debt Consolidation",
  "Marketing & Growth",
];

const Analyze = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FinancialData>({
    revenue: 0,
    expenses: 0,
    cash: 0,
    debt: 0,
    goal: "",
  });

  const handleChange = (field: keyof FinancialData, value: string) => {
    if (field === "goal") {
      setForm((p) => ({ ...p, goal: value }));
    } else {
      setForm((p) => ({ ...p, [field]: Number(value) || 0 }));
    }
  };

  const handleAnalyze = async () => {
    if (!form.goal) {
      toast({ title: "Please select a funding goal", variant: "destructive" });
      return;
    }
    if (form.revenue <= 0) {
      toast({ title: "Please enter a valid monthly revenue", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const metrics = calculateMetrics(form);
      const readinessScore = calculateReadinessScore(metrics, form.revenue);

      const { data, error } = await supabase.functions.invoke("financial-analysis", {
        body: { financialData: form, metrics, readinessScore },
      });

      if (error) throw error;

      const results = {
        ...data,
        metrics,
        readiness: { score: readinessScore, reason: data.readinessReason },
      };

      // Save to database if user is logged in
      if (user) {
        const { error: dbError } = await supabase.from("financial_analyses").insert({
          user_id: user.id,
          revenue: form.revenue,
          expenses: form.expenses,
          cash: form.cash,
          debt: form.debt,
          goal: form.goal,
          burn_rate: metrics.burnRate,
          runway_months: String(metrics.runwayMonths),
          debt_ratio: metrics.debtRatio,
          risk_level: metrics.riskLevel,
          readiness_score: readinessScore,
          ai_summary: data.aiSummary,
          readiness_reason: data.readinessReason,
          recommendation: data.recommendation,
          loan_application: data.loanApplication,
          rejection_risks: data.rejectionRisks,
          improvements: data.improvements,
        });
        if (dbError) console.error("Failed to save analysis:", dbError);
      }

      sessionStorage.setItem("finpilot-results", JSON.stringify(results));
      navigate("/dashboard");
    } catch (e: any) {
      console.error(e);
      toast({ title: "Analysis failed", description: e.message || "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: "revenue" as const, label: "Monthly Revenue (₹)", placeholder: "e.g. 500000" },
    { key: "expenses" as const, label: "Monthly Expenses (₹)", placeholder: "e.g. 350000" },
    { key: "cash" as const, label: "Cash Balance (₹)", placeholder: "e.g. 2000000" },
    { key: "debt" as const, label: "Existing Debt (₹)", placeholder: "e.g. 1000000" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-xl px-6 py-12">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
          <h2 className="mb-1 font-heading text-xl font-bold text-card-foreground">
            Enter Business Financial Data
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">
            All data is encrypted and saved to your account for future reference.
          </p>

          <div className="space-y-5">
            {fields.map(({ key, label, placeholder }) => (
              <div key={key} className="space-y-1.5">
                <Label htmlFor={key} className="text-sm font-medium">{label}</Label>
                <Input
                  id={key}
                  type="number"
                  placeholder={placeholder}
                  value={form[key] || ""}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="h-11"
                />
              </div>
            ))}

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Funding Goal</Label>
              <Select value={form.goal} onValueChange={(v) => handleChange("goal", v)}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select your funding goal" />
                </SelectTrigger>
                <SelectContent>
                  {fundingGoals.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              className="h-12 w-full gap-2 gradient-primary text-primary-foreground shadow-primary text-base font-semibold"
              onClick={handleAnalyze}
              disabled={loading}
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {loading ? "Analyzing with AI..." : "Analyze with AI"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analyze;
