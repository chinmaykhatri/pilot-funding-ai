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

// Funding Readiness Score (deterministic formula)
export function calculateReadinessScore(metrics: FinancialMetrics): number {
  let runwayFactor = 0;
  if (metrics.runwayMonths === "stable") {
    runwayFactor = 40;
  } else {
    runwayFactor = Math.min(40, (metrics.runwayMonths / 24) * 40);
  }

  const cashFlowHealth = metrics.burnRate === 0 ? 30 : Math.max(0, 30 - (metrics.burnRate / 10000) * 15);
  const debtFactor = Math.max(0, 30 - metrics.debtRatio * 30);

  return Math.round(Math.min(100, runwayFactor + cashFlowHealth + debtFactor));
}
