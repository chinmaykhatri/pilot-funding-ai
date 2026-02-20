import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import LoanApplicationView from "@/components/LoanApplicationView";
import { LoanApplication } from "@/lib/financial-calculations";
import { ArrowLeft, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const LoanApp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [application, setApplication] = useState<LoanApplication | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    businessName: "",
    industry: "",
    revenue: 0,
    expenses: 0,
    cash: 0,
    debt: 0,
    fundingAmount: 0,
    fundingPurpose: "",
  });

  // Load from session if available (came from full analysis)
  useEffect(() => {
    const stored = sessionStorage.getItem("finpilot-results");
    if (stored) {
      try {
        const results = JSON.parse(stored);
        if (results.loanApplication) setApplication(results.loanApplication);
      } catch { /* ignore */ }
    }
  }, []);

  const handleChange = (field: string, value: string) => {
    const numFields = ["revenue", "expenses", "cash", "debt", "fundingAmount"];
    setForm((p) => ({
      ...p,
      [field]: numFields.includes(field) ? Number(value) || 0 : value,
    }));
  };

  const handleGenerate = async () => {
    if (!form.fundingPurpose) {
      toast({ title: "Please enter a funding purpose", variant: "destructive" });
      return;
    }
    if (form.revenue <= 0) {
      toast({ title: "Please enter a valid monthly revenue", variant: "destructive" });
      return;
    }
    if (form.fundingAmount <= 0) {
      toast({ title: "Please enter a funding amount", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-loan-application", {
        body: form,
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      setApplication(data);
    } catch (e: any) {
      console.error(e);
      toast({ title: "Generation failed", description: e.message || "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: "businessName", label: "Business Name", placeholder: "e.g. ABC Enterprises", type: "text" },
    { key: "industry", label: "Industry", placeholder: "e.g. Manufacturing, IT Services", type: "text" },
    { key: "revenue", label: "Monthly Revenue (₹)", placeholder: "e.g. 500000", type: "number" },
    { key: "expenses", label: "Monthly Expenses (₹)", placeholder: "e.g. 350000", type: "number" },
    { key: "cash", label: "Cash Balance (₹)", placeholder: "e.g. 2000000", type: "number" },
    { key: "debt", label: "Existing Debt (₹)", placeholder: "e.g. 1000000", type: "number" },
    { key: "fundingAmount", label: "Funding Amount Requested (₹)", placeholder: "e.g. 2500000", type: "number" },
    { key: "fundingPurpose", label: "Purpose of Funding", placeholder: "e.g. Equipment purchase, Business expansion", type: "text" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-3xl px-6 py-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
        </button>
        <div className="mb-6 flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Loan Application Generator
          </h1>
        </div>

        {/* Manual Input Form */}
        <div className="mb-8 rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="mb-1 font-heading text-lg font-semibold text-card-foreground">
            Enter Business Details
          </h2>
          <p className="mb-5 text-sm text-muted-foreground">
            Fill in your business details to generate a professional bank-ready loan application.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map(({ key, label, placeholder, type }) => (
              <div key={key} className="space-y-1.5">
                <Label htmlFor={key} className="text-sm font-medium">
                  {label}
                </Label>
                <Input
                  id={key}
                  type={type}
                  placeholder={placeholder}
                  value={type === "number" ? (form[key as keyof typeof form] || "") : (form[key as keyof typeof form] as string)}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="h-10"
                />
              </div>
            ))}
          </div>
          <Button
            className="mt-5 h-11 w-full gap-2 gradient-primary text-primary-foreground shadow-primary font-semibold"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {loading ? "Generating with AI..." : "Generate Loan Application"}
          </Button>
        </div>

        {/* Generated Application */}
        {application && <LoanApplicationView application={application} />}
      </div>
    </div>
  );
};

export default LoanApp;
