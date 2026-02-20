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

export interface ScoreBreakdownFactor {
  points: number;
  max: number;
  reason: string;
}

export interface FundingReadiness {
  readiness_score: number;
  classification: "Strong" | "Moderate" | "Weak" | "High Risk";
  breakdown: {
    runway: ScoreBreakdownFactor;
    cashflow: ScoreBreakdownFactor;
    debt: ScoreBreakdownFactor;
  };
  calculation_summary: string;
  professional_explanation: string;
}

import { SmartFundingRecommendation } from "./funding-recommendation";
import { FormalLoanApplication } from "./loan-application-generator";
import { RejectionAnalysis } from "./rejection-risk-engine";
import { FinancialRoadmap } from "./improvement-roadmap-engine";

export interface AnalysisResult {
  metrics: FinancialMetrics;
  readiness: FundingReadiness;
  recommendation: SmartFundingRecommendation;
  loanApplication: FormalLoanApplication;
  rejectionRisks: RejectionAnalysis;
  improvements: FinancialRoadmap;
  aiSummary: string;
}

// Deterministic financial calculations
export function calculateMetrics(data: FinancialData): FinancialMetrics {
  // Guard against NaN/negative/Infinity
  const revenue = Math.max(0, Number(data.revenue) || 0);
  const expenses = Math.max(0, Number(data.expenses) || 0);
  const cash = Math.max(0, Number(data.cash) || 0);
  const debt = Math.max(0, Number(data.debt) || 0);

  const burnRate = Math.max(0, expenses - revenue);
  const runwayMonths: number | "stable" = burnRate === 0
    ? "stable"
    : Math.min(999, Math.round((cash / burnRate) * 10) / 10);
  const annualRevenue = revenue * 12;
  const debtRatio = annualRevenue > 0
    ? Math.min(99.99, Math.round((debt / annualRevenue) * 100) / 100)
    : (debt > 0 ? 99.99 : 0);

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
export function calculateReadinessScore(metrics: FinancialMetrics, revenue: number): FundingReadiness {
  // 1. RUNWAY FACTOR (0–40 points)
  let runwayPoints: number;
  let runwayReason: string;
  if (metrics.runwayMonths === "stable" || (typeof metrics.runwayMonths === "number" && metrics.runwayMonths > 12)) {
    runwayPoints = 40;
    runwayReason = metrics.runwayMonths === "stable"
      ? "Business is profitable with stable (infinite) runway"
      : `Runway of ${metrics.runwayMonths} months exceeds 12-month threshold`;
  } else if (typeof metrics.runwayMonths === "number" && metrics.runwayMonths >= 6) {
    runwayPoints = 25;
    runwayReason = `Runway of ${metrics.runwayMonths} months is in the 6–12 month range`;
  } else if (typeof metrics.runwayMonths === "number" && metrics.runwayMonths >= 3) {
    runwayPoints = 15;
    runwayReason = `Runway of ${metrics.runwayMonths} months is in the 3–6 month range — moderate concern`;
  } else {
    runwayPoints = 5;
    runwayReason = typeof metrics.runwayMonths === "number"
      ? `Runway of ${metrics.runwayMonths} months is critically low (below 3 months)`
      : "Insufficient runway data";
  }

  // 2. CASH FLOW HEALTH (0–30 points)
  let cashflowPoints: number;
  let cashflowReason: string;
  if (metrics.burnRate === 0) {
    // Profitable: revenue >= expenses
    cashflowPoints = 30;
    cashflowReason = "Business is profitable — revenue meets or exceeds expenses";
  } else if (revenue > 0 && metrics.burnRate < revenue * 0.2) {
    cashflowPoints = 20;
    cashflowReason = `Burn rate (₹${metrics.burnRate.toLocaleString()}) is less than 20% of revenue`;
  } else if (revenue > 0 && metrics.burnRate <= revenue * 0.5) {
    cashflowPoints = 12;
    cashflowReason = `Burn rate (₹${metrics.burnRate.toLocaleString()}) is 20–50% of revenue — needs attention`;
  } else {
    cashflowPoints = 5;
    cashflowReason = revenue > 0
      ? `Burn rate (₹${metrics.burnRate.toLocaleString()}) exceeds 50% of revenue — high risk`
      : "No revenue reported — cash flow health cannot be assessed";
  }

  // 3. DEBT RATIO FACTOR (0–30 points)
  let debtPoints: number;
  let debtReason: string;
  if (metrics.debtRatio < 0.2) {
    debtPoints = 30;
    debtReason = `Debt ratio of ${metrics.debtRatio.toFixed(2)} is excellent (below 0.2)`;
  } else if (metrics.debtRatio <= 0.5) {
    debtPoints = 20;
    debtReason = `Debt ratio of ${metrics.debtRatio.toFixed(2)} is manageable (0.2–0.5 range)`;
  } else if (metrics.debtRatio <= 0.8) {
    debtPoints = 10;
    debtReason = `Debt ratio of ${metrics.debtRatio.toFixed(2)} is elevated (0.5–0.8 range) — reduce debt`;
  } else {
    debtPoints = 5;
    debtReason = `Debt ratio of ${metrics.debtRatio.toFixed(2)} is dangerously high (above 0.8)`;
  }

  // TOTAL SCORE
  const totalScore = Math.min(100, runwayPoints + cashflowPoints + debtPoints);

  // CLASSIFICATION
  let classification: "Strong" | "Moderate" | "Weak" | "High Risk";
  if (totalScore >= 80) classification = "Strong";
  else if (totalScore >= 60) classification = "Moderate";
  else if (totalScore >= 40) classification = "Weak";
  else classification = "High Risk";

  const calculation_summary = `Runway Factor: ${runwayPoints}/40 + Cash Flow Health: ${cashflowPoints}/30 + Debt Ratio: ${debtPoints}/30 = ${totalScore}/100 (${classification})`;

  const explanations: Record<string, string> = {
    "Strong": `With a score of ${totalScore}/100, this business demonstrates strong financial health and is well-positioned for funding applications. Lenders will view this profile favorably.`,
    "Moderate": `With a score of ${totalScore}/100, this business shows moderate financial stability. Some areas need improvement before approaching lenders, but the fundamentals are in place.`,
    "Weak": `With a score of ${totalScore}/100, the business has notable financial weaknesses that lenders will scrutinize. Focused improvement in the weakest areas is recommended before applying for funding.`,
    "High Risk": `With a score of ${totalScore}/100, the business presents significant financial risk. Immediate corrective action is needed on cash flow and debt management before pursuing external funding.`,
  };

  return {
    readiness_score: totalScore,
    classification,
    breakdown: {
      runway: { points: runwayPoints, max: 40, reason: runwayReason },
      cashflow: { points: cashflowPoints, max: 30, reason: cashflowReason },
      debt: { points: debtPoints, max: 30, reason: debtReason },
    },
    calculation_summary,
    professional_explanation: explanations[classification],
  };
}
