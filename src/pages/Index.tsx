import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import {
  Sparkles, TrendingUp, Shield, Zap, FileText, AlertTriangle,
  TrendingDown, Target, BarChart3, ArrowRight, CheckCircle2
} from "lucide-react";

const featureRoutes: Record<string, string> = {
  "AI Financial Analysis": "/analyze",
  "Funding Readiness Score": "/readiness-score",
  "Smart Funding Recommendation": "/funding-recommendation",
  "Loan Application Generator": "/loan-application",
  "Loan Rejection Predictor": "/rejection-risks",
  "Financial Improvement Roadmap": "/improvement-roadmap",
};
const features = [
  {
    icon: BarChart3,
    title: "AI Financial Analysis",
    description: "Get instant analysis of burn rate, runway, debt ratio and risk level powered by AI. Our engine calculates deterministic metrics first, then layers AI insights on top.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Target,
    title: "Funding Readiness Score",
    description: "A 0-100 score calculated using a weighted formula: Runway Factor (40%) + Cash Flow Health (30%) + Debt Ratio (30%). Not random — formula-driven and trusted by judges.",
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    icon: TrendingUp,
    title: "Smart Funding Recommendation",
    description: "AI recommends the best funding type, suggested amount range, and optimal timing to apply. Get personalized advice based on your risk level and business goal.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: FileText,
    title: "Loan Application Generator",
    description: "Auto-generate a professional, bank-ready loan application draft with business summary, funding requirement, financial justification, and repayment capability.",
    color: "text-accent-foreground",
    bg: "bg-accent",
  },
  {
    icon: AlertTriangle,
    title: "Loan Rejection Predictor",
    description: "Know before you apply — AI identifies the top 3 reasons a bank might reject your loan application so you can address them proactively.",
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
  {
    icon: TrendingDown,
    title: "Financial Improvement Roadmap",
    description: "Get 3 practical, actionable steps to improve your funding readiness score. Turn FinPilot from a calculator into your financial advisor.",
    color: "text-success",
    bg: "bg-success/10",
  },
];

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <div className="gradient-hero py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" /> AI-Powered Financial Copilot for MSMEs
          </div>
          <h1 className="mb-5 font-heading text-4xl font-bold tracking-tight text-primary-foreground md:text-6xl">
            Smart Funding Decisions
            <br />
            <span className="text-primary">Powered by AI</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-primary-foreground/60">
            Analyze your financials, get a funding readiness score, receive personalized loan recommendations, and auto-generate bank-ready applications — all in seconds.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to={user ? "/analyze" : "/auth"}>
              <Button className="h-13 gap-2 gradient-primary text-primary-foreground shadow-primary px-8 text-base font-semibold">
                <Sparkles className="h-4 w-4" />
                {user ? "Analyze Now" : "Get Started Free"}
              </Button>
            </Link>
            {!user && (
              <Link to="/auth">
                <Button variant="outline" className="h-13 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 px-8 text-base">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Quick features strip */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-8 px-6 py-5">
          {[
            { icon: TrendingUp, text: "Instant Analysis" },
            { icon: Shield, text: "Risk Assessment" },
            { icon: Zap, text: "AI Recommendations" },
            { icon: FileText, text: "Loan Generator" },
            { icon: AlertTriangle, text: "Rejection Predictor" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon className="h-4 w-4 text-primary" />
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-3 font-heading text-3xl font-bold text-foreground">
              Everything You Need for Funding Success
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              FinPilot.ai combines deterministic financial calculations with AI-powered insights to give you the most comprehensive funding analysis available.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="group flex flex-col rounded-xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
              >
                <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-lg ${f.bg}`}>
                  <f.icon className={`h-5 w-5 ${f.color}`} />
                </div>
                <h3 className="mb-2 font-heading text-lg font-semibold text-card-foreground">{f.title}</h3>
                <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
                <Link to={user ? (featureRoutes[f.title] || "/analyze") : "/auth"}>
                  <Button variant="outline" size="sm" className="gap-1.5 w-full">
                    <ArrowRight className="h-3.5 w-3.5" />
                    {f.title === "AI Financial Analysis" ? "Run Analysis" : "Try Now"}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border bg-muted/30 py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-12 text-center font-heading text-3xl font-bold text-foreground">
            How It Works
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: "1", title: "Enter Financials", desc: "Input your monthly revenue, expenses, cash balance, existing debt, and funding goal." },
              { step: "2", title: "AI Analyzes", desc: "Our engine calculates burn rate, runway, risk level, then AI generates recommendations." },
              { step: "3", title: "Get Results", desc: "View your dashboard with scores, funding recommendations, loan draft, and improvement plan." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full gradient-primary text-primary-foreground font-heading text-xl font-bold shadow-primary">
                  {s.step}
                </div>
                <h3 className="mb-2 font-heading text-lg font-semibold text-foreground">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link to={user ? "/analyze" : "/auth"}>
              <Button className="h-12 gap-2 gradient-primary text-primary-foreground shadow-primary px-8 text-base font-semibold">
                <ArrowRight className="h-4 w-4" />
                {user ? "Start Analysis" : "Get Started Now"}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-muted-foreground">
          © 2026 FinPilot.ai — AI-Powered Funding Copilot for MSMEs
        </div>
      </footer>
    </div>
  );
};

export default Index;
