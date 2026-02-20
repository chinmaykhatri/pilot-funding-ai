import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, TrendingUp, Shield, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
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

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
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
      // Calculate deterministic metrics first
      const metrics = calculateMetrics(form);
      const readinessScore = calculateReadinessScore(metrics);

      // Call AI edge function for analysis
      const { data, error } = await supabase.functions.invoke("financial-analysis", {
        body: { financialData: form, metrics, readinessScore },
      });

      if (error) throw error;

      // Store results and navigate
      sessionStorage.setItem(
        "finpilot-results",
        JSON.stringify({ ...data, metrics, readiness: { score: readinessScore, reason: data.readinessReason } })
      );
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

      {/* Hero */}
      <div className="gradient-hero py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" /> AI-Powered Financial Copilot
          </div>
          <h1 className="mb-4 font-heading text-4xl font-bold tracking-tight text-primary-foreground md:text-5xl">
            Smart Funding Decisions
            <br />
            <span className="text-primary">for Your MSME</span>
          </h1>
          <p className="mx-auto max-w-xl text-lg text-primary-foreground/60">
            Get instant AI analysis of your financials, funding readiness score, and personalized loan recommendations.
          </p>
        </div>
      </div>

      {/* Features strip */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-8 px-6 py-5">
          {[
            { icon: TrendingUp, text: "Financial Analysis" },
            { icon: Shield, text: "Risk Assessment" },
            { icon: Zap, text: "Instant Recommendations" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon className="h-4 w-4 text-primary" />
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="mx-auto max-w-xl px-6 py-12">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
          <h2 className="mb-1 font-heading text-xl font-bold text-card-foreground">
            Enter Business Financial Data
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">
            All data stays private and is only used for your analysis.
          </p>

          <div className="space-y-5">
            {fields.map(({ key, label, placeholder }) => (
              <div key={key} className="space-y-1.5">
                <Label htmlFor={key} className="text-sm font-medium">
                  {label}
                </Label>
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
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
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
              {loading ? "Analyzing..." : "Analyze with AI"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
