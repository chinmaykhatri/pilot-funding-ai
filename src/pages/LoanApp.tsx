import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import LoanApplicationView from "@/components/LoanApplicationView";
import RejectionPredictor from "@/components/RejectionPredictor";
import { FormalLoanApplication, generateLoanApplication } from "@/lib/loan-application-generator";
import { calculateMetrics, calculateReadinessScore } from "@/lib/financial-calculations";
import { RejectionAnalysis, analyzeRejectionRisks } from "@/lib/rejection-risk-engine";
import { ArrowLeft, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const LoanApp = () => {
  const navigate = useNavigate();
  const [application, setApplication] = useState<FormalLoanApplication | null>(null);
  const [rejectionAnalysis, setRejectionAnalysis] = useState<RejectionAnalysis | null>(null);
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
        if (results.rejectionRisks) setRejectionAnalysis(results.rejectionRisks);
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

  const handleGenerate = () => {
    const app = generateLoanApplication(form);
    setApplication(app);

    // Run the full rejection risk engine
    const metrics = calculateMetrics({
      revenue: form.revenue,
      expenses: form.expenses,
      cash: form.cash,
      debt: form.debt,
      goal: form.fundingPurpose,
    });
    const readiness = calculateReadinessScore(metrics, form.revenue);
    const analysis = analyzeRejectionRisks(
      metrics, readiness, form.revenue, form.expenses,
      form.cash, form.debt, form.fundingAmount, form.fundingPurpose
    );
    setRejectionAnalysis(analysis);
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

  const isFormValid = form.revenue > 0 && form.fundingAmount > 0 && form.fundingPurpose.length > 0;

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
        <p className="mb-6 text-sm text-muted-foreground">
          Generate a professional, print-ready loan application letter in the standard Indian bank format. Includes instant credit risk assessment — no AI wait time.
        </p>

        {/* Manual Input Form */}
        <div className="mb-8 rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="mb-1 font-heading text-lg font-semibold text-card-foreground">
            Enter Business Details
          </h2>
          <p className="mb-5 text-sm text-muted-foreground">
            Fill in your business details to generate a formal bank-ready loan application letter with risk assessment.
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
            disabled={!isFormValid}
          >
            <Sparkles className="h-4 w-4" />
            Generate Loan Application
          </Button>
        </div>

        {/* Generated Application + Risk Analysis */}
        {application && (
          <div className="space-y-6">
            <LoanApplicationView application={application} />
            {rejectionAnalysis && <RejectionPredictor analysis={rejectionAnalysis} />}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanApp;
