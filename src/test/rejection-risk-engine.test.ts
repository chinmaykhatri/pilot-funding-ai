import { describe, it, expect } from "vitest";
import { analyzeRejectionRisks } from "@/lib/rejection-risk-engine";
import { calculateMetrics, calculateReadinessScore } from "@/lib/financial-calculations";

// Helper to build context quickly
function analyze(overrides: {
    revenue?: number;
    expenses?: number;
    cash?: number;
    debt?: number;
    fundingAmount?: number;
    goal?: string;
}) {
    const defaults = {
        revenue: 500000,
        expenses: 350000,
        cash: 2000000,
        debt: 500000,
        fundingAmount: 2000000,
        goal: "Working Capital",
    };
    const d = { ...defaults, ...overrides };
    const metrics = calculateMetrics(d);
    const readiness = calculateReadinessScore(metrics, d.revenue);
    return analyzeRejectionRisks(
        metrics, readiness, d.revenue, d.expenses, d.cash, d.debt, d.fundingAmount, d.goal
    );
}

describe("analyzeRejectionRisks", () => {
    it("returns 1-3 rejection risks", () => {
        const result = analyze({});
        expect(result.rejection_analysis.length).toBeGreaterThanOrEqual(1);
        expect(result.rejection_analysis.length).toBeLessThanOrEqual(3);
    });

    it("returns overall_risk_level and approval_probability", () => {
        const result = analyze({});
        expect(["High", "Medium", "Low"]).toContain(result.overall_risk_level);
        expect(result.approval_probability).toBeTruthy();
    });

    it("flags negative surplus as High severity", () => {
        const result = analyze({ revenue: 200000, expenses: 300000 });
        const negativeSurplus = result.rejection_analysis.find(r =>
            r.risk_title.toLowerCase().includes("surplus") ||
            r.risk_title.toLowerCase().includes("negative")
        );
        expect(negativeSurplus).toBeTruthy();
        expect(negativeSurplus!.severity).toBe("High");
    });

    it("flags extreme debt ratio (>0.8) as High severity", () => {
        const result = analyze({ debt: 10000000, revenue: 500000 });
        const debtRisk = result.rejection_analysis.find(r =>
            r.risk_title.toLowerCase().includes("debt")
        );
        expect(debtRisk).toBeTruthy();
        expect(debtRisk!.severity).toBe("High");
    });

    it("flags excessive funding request (>annual revenue) as High severity", () => {
        const result = analyze({ fundingAmount: 10000000, revenue: 500000 });
        const fundingRisk = result.rejection_analysis.find(r =>
            r.risk_title.toLowerCase().includes("funding") ||
            r.risk_title.toLowerCase().includes("exceeds")
        );
        expect(fundingRisk).toBeTruthy();
        expect(fundingRisk!.severity).toBe("High");
    });

    it("each risk has risk_title, severity, why_it_matters, how_to_improve", () => {
        const result = analyze({});
        for (const risk of result.rejection_analysis) {
            expect(risk.risk_title).toBeTruthy();
            expect(["High", "Medium", "Low"]).toContain(risk.severity);
            expect(risk.why_it_matters.length).toBeGreaterThan(20);
            expect(risk.how_to_improve.length).toBeGreaterThan(10);
        }
    });

    it("healthy profile gets Low overall risk", () => {
        const result = analyze({
            revenue: 1000000,
            expenses: 500000,
            cash: 5000000,
            debt: 200000,
            fundingAmount: 1000000,
        });
        expect(result.overall_risk_level).toBe("Low");
        expect(result.approval_probability).toMatch(/good/i);
    });

    it("severely distressed profile gets High overall risk", () => {
        const result = analyze({
            revenue: 100000,
            expenses: 150000,
            cash: 50000,
            debt: 5000000,
            fundingAmount: 5000000,
        });
        expect(result.overall_risk_level).toBe("High");
        expect(result.approval_probability).toMatch(/low/i);
    });

    it("zero revenue flags no revenue risk", () => {
        const result = analyze({ revenue: 0 });
        const noRevenue = result.rejection_analysis.find(r =>
            r.risk_title.toLowerCase().includes("revenue")
        );
        expect(noRevenue).toBeTruthy();
        expect(noRevenue!.severity).toBe("High");
    });

    it("improvement suggestions include actionable guidance", () => {
        const result = analyze({ revenue: 200000, expenses: 300000, debt: 5000000 });
        for (const risk of result.rejection_analysis) {
            // Each fix should be substantial, not a placeholder
            expect(risk.how_to_improve.length).toBeGreaterThan(30);
        }
    });
});
