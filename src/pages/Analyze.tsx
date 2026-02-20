import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { FinancialData, calculateMetrics, calculateReadinessScore, FundingReadiness } from "@/lib/financial-calculations";
import { calculateFundingRecommendation } from "@/lib/funding-recommendation";
import { generateLoanApplication } from "@/lib/loan-application-generator";
import { analyzeRejectionRisks } from "@/lib/rejection-risk-engine";
import { generateFinancialRoadmap } from "@/lib/improvement-roadmap-engine";
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

  // Realistic MSME demo profile
  const loadDemoProfile = () => {
    setForm({
      revenue: 500000,
      expenses: 350000,
      cash: 2000000,
      debt: 1000000,
      goal: "Working Capital",
    });
    toast({ title: "Demo profile loaded", description: "Sample MSME data filled — hit Analyze to see results." });
  };

  const handleChange = (field: keyof FinancialData, value: string) => {
    if (field === "goal") {
      setForm((p) => ({ ...p, goal: value }));
    } else {
      setForm((p) => ({ ...p, [field]: Math.max(0, Number(value) || 0) }));
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
      const readiness: FundingReadiness = calculateReadinessScore(metrics, form.revenue);
      const recommendation = calculateFundingRecommendation(metrics, readiness, form.revenue, form.goal);
      const loanApplication = generateLoanApplication({
        businessName: "",
        industry: "",
        revenue: form.revenue,
        expenses: form.expenses,
        cash: form.cash,
        debt: form.debt,
        fundingAmount: Math.round(form.revenue * 3),
        fundingPurpose: form.goal,
      });
      const rejectionRisks = analyzeRejectionRisks(
        metrics, readiness, form.revenue, form.expenses,
        form.cash, form.debt, Math.round(form.revenue * 3), form.goal
      );
      const improvements = generateFinancialRoadmap(
        metrics, readiness, form.revenue, form.expenses,
        form.cash, form.debt, form.goal
      );

      // AI summary — gracefully degrade if edge function fails
      let aiSummary: string;
      try {
        const { data, error } = await supabase.functions.invoke("financial-analysis", {
          body: { financialData: form, metrics, readinessScore: readiness.readiness_score },
        });
        aiSummary = data?.aiSummary || `Your business has a funding readiness score of ${readiness.readiness_score}/100, classified as ${readiness.classification}. ${readiness.professional_explanation}`;
        if (error) console.warn("AI summary unavailable, using fallback:", error.message);
      } catch (aiErr) {
        console.warn("AI edge function failed, using deterministic fallback:", aiErr);
        aiSummary = `Your business has a funding readiness score of ${readiness.readiness_score}/100, classified as ${readiness.classification}. ${readiness.professional_explanation}`;
      }

      const results = {
        metrics,
        readiness,
        recommendation,
        loanApplication,
        rejectionRisks,
        improvements,
        aiSummary,
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
          readiness_score: readiness.readiness_score,
          ai_summary: aiSummary,
          readiness_reason: readiness.professional_explanation,
          recommendation: recommendation,
          loan_application: loanApplication,
          rejection_risks: rejectionRisks,
          improvements: improvements,
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
    { key: "revenue" as const, label: "Monthly Revenue (₹)", placeholder: "e.g. 500000", hint: "Average monthly income" },
    { key: "expenses" as const, label: "Monthly Operating Expenses (₹)", placeholder: "e.g. 350000", hint: "Rent, salaries, utilities, raw materials" },
    { key: "cash" as const, label: "Current Cash / Bank Balance (₹)", placeholder: "e.g. 2000000", hint: "Total liquid funds available today" },
    { key: "debt" as const, label: "Total Outstanding Debt (₹)", placeholder: "e.g. 1000000", hint: "All existing loans and liabilities" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-xl px-6 py-12 page-transition">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-card card-interactive">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="font-heading text-xl font-bold text-card-foreground">
              Enter Business Financial Data
            </h2>
            <Button variant="ghost" size="sm" onClick={loadDemoProfile} className="gap-1 text-xs text-primary hover:text-primary/80 btn-premium">
              <Sparkles className="h-3 w-3" /> Try Demo
            </Button>
          </div>
          <p className="mb-6 text-sm text-muted-foreground">
            Your data is processed locally. Only an AI summary is generated via the cloud.
          </p>

          <div className="space-y-5">
            {fields.map(({ key, label, placeholder, hint }) => (
              <div key={key} className="space-y-1.5">
                <Label htmlFor={key} className="text-sm font-medium">{label}</Label>
                <Input
                  id={key}
                  type="number"
                  min="0"
                  placeholder={placeholder}
                  value={form[key] || ""}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="h-11"
                />
                <p className="text-[11px] text-muted-foreground/70">{hint}</p>
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
              className="h-12 w-full gap-2 gradient-primary text-primary-foreground shadow-primary text-base font-semibold btn-premium"
              onClick={handleAnalyze}
              disabled={loading}
            >
              {loading ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                    <span>Analyzing financial data…</span>
                  </div>
                </div>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Analyze My Business
                </>
              )}
            </Button>

            {loading && (
              <div className="mt-3 space-y-1.5 animate-fade-in">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-success animate-ping" />
                  Calculating deterministic metrics…
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground" style={{ animationDelay: '200ms' }}>
                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" style={{ animationDelay: '200ms' }} />
                  Generating AI summary…
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground" style={{ animationDelay: '400ms' }}>
                  <div className="h-1.5 w-1.5 rounded-full bg-warning animate-ping" style={{ animationDelay: '400ms' }} />
                  Building funding recommendations…
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analyze;
