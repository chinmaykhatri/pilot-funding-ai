export interface FinancialData {
  revenue: number;
  expenses: number;
  cash: number;
  debt: number;
  goal: string;
}

export interface FinancialMetrics {
  burnRate: number;
  runwayMonths: number | "stable";
  debtRatio: number;
  riskLevel: "Low" | "Moderate" | "High";
}

export interface FundingReadiness {
  score: number;
  reason: string;
}

export interface FundingRecommendation {
  fundingType: string;
  amountRange: string;
  timing: string;
  reason: string;
}

export interface LoanApplication {
  businessSummary: string;
  fundingRequirement: string;
  financialJustification: string;
  repaymentCapability: string;
}

export interface RejectionRisk {
  risks: string[];
}

export interface ImprovementStep {
  steps: string[];
}

export interface AnalysisResult {
  metrics: FinancialMetrics;
  readiness: FundingReadiness;
  recommendation: FundingRecommendation;
  loanApplication: LoanApplication;
  rejectionRisks: RejectionRisk;
  improvements: ImprovementStep;
  aiSummary: string;
}

// Deterministic financial calculations
export function calculateMetrics(data: FinancialData): FinancialMetrics {
  const burnRate = Math.max(0, data.expenses - data.revenue);
  const runwayMonths: number | "stable" = burnRate === 0 ? "stable" : Math.round((data.cash / burnRate) * 10) / 10;
  const debtRatio = Math.round((data.debt / (data.revenue * 12)) * 100) / 100;

  let riskLevel: "Low" | "Moderate" | "High";
  if (runwayMonths === "stable" || (typeof runwayMonths === "number" && runwayMonths > 12 && debtRatio < 0.5)) {
    riskLevel = "Low";
  } else if (typeof runwayMonths === "number" && runwayMonths >= 6 && runwayMonths <= 12) {
    riskLevel = "Moderate";
  } else {
    riskLevel = "High";
  }

  return { burnRate, runwayMonths, debtRatio, riskLevel };
}

// Funding Readiness Score (deterministic discrete-tier formula)
export function calculateReadinessScore(metrics: FinancialMetrics, revenue: number): number {
  // Runway factor (max 40)
  let runwayFactor: number;
  if (metrics.runwayMonths === "stable" || (typeof metrics.runwayMonths === "number" && metrics.runwayMonths > 12)) {
    runwayFactor = 40;
  } else if (typeof metrics.runwayMonths === "number" && metrics.runwayMonths >= 6) {
    runwayFactor = 25;
  } else {
    runwayFactor = 10;
  }

  // Debt factor (max 30)
  let debtFactor: number;
  if (metrics.debtRatio < 0.2) {
    debtFactor = 30;
  } else if (metrics.debtRatio <= 0.5) {
    debtFactor = 20;
  } else {
    debtFactor = 10;
  }

  // Cashflow factor (max 30)
  let cashflowFactor: number;
  if (metrics.burnRate === 0) {
    cashflowFactor = 30;
  } else if (revenue > 0 && metrics.burnRate < revenue * 0.2) {
    cashflowFactor = 20;
  } else {
    cashflowFactor = 10;
  }

  return Math.round(Math.min(100, runwayFactor + debtFactor + cashflowFactor));
}
