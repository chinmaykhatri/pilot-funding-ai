import { describe, it, expect } from "vitest";
import { calculateMetrics, calculateReadinessScore, FinancialData } from "@/lib/financial-calculations";

// Helper to create metrics from financial data
function score(data: FinancialData) {
    const metrics = calculateMetrics(data);
    return calculateReadinessScore(metrics, data.revenue);
}

describe("calculateReadinessScore", () => {
    it("returns Strong (100) for profitable business with low debt", () => {
        const result = score({ revenue: 500000, expenses: 400000, cash: 2000000, debt: 500000, goal: "Expansion" });
        expect(result.readiness_score).toBe(100); // 40 + 30 + 30
        expect(result.classification).toBe("Strong");
        expect(result.breakdown.runway.points).toBe(40);
        expect(result.breakdown.cashflow.points).toBe(30);
        expect(result.breakdown.debt.points).toBe(30);
    });

    it("returns Strong (90) for stable runway, profitable, medium debt (0.2–0.5)", () => {
        const result = score({ revenue: 500000, expenses: 400000, cash: 2000000, debt: 2000000, goal: "WC" });
        // Runway: stable (profitable) → 40, Cashflow: profitable → 30, Debt: 2M/(500k*12)=0.33 → 20
        expect(result.readiness_score).toBe(90);
        expect(result.classification).toBe("Strong");
        expect(result.breakdown.debt.points).toBe(20);
    });

    it("returns Moderate (65) for 6–12mo runway, burn <20%, debt 0.2–0.5", () => {
        // Revenue 300k, Expenses 350k → burn=50k, Cash=500k → runway=10mo
        // Debt=1M → ratio=1M/(300k*12)=0.28
        const result = score({ revenue: 300000, expenses: 350000, cash: 500000, debt: 1000000, goal: "WC" });
        expect(result.readiness_score).toBe(65); // 25 + 20 + 20
        expect(result.classification).toBe("Moderate");
        expect(result.breakdown.runway.points).toBe(25);
        expect(result.breakdown.cashflow.points).toBe(20);
        expect(result.breakdown.debt.points).toBe(20);
    });

    it("returns Weak (47) for 3–6mo runway, burn 20–50%, debt 0.2–0.5", () => {
        // Revenue 200k, Expenses 280k → burn=80k, Cash=400k → runway=5mo
        // 80k / 200k = 0.4 (20–50%)
        // Debt=800k → ratio=800k/(200k*12)=0.33
        const result = score({ revenue: 200000, expenses: 280000, cash: 400000, debt: 800000, goal: "WC" });
        expect(result.readiness_score).toBe(47); // 15 + 12 + 20
        expect(result.classification).toBe("Weak");
    });

    it("returns High Risk (15) for <3mo runway, burn >50%, debt >0.8", () => {
        // Revenue 100k, Expenses 200k → burn=100k, Cash=200k → runway=2mo
        // 100k / 100k = 1.0 (>50%)
        // Debt=2M → ratio=2M/(100k*12)=1.67
        const result = score({ revenue: 100000, expenses: 200000, cash: 200000, debt: 2000000, goal: "WC" });
        expect(result.readiness_score).toBe(15); // 5 + 5 + 5
        expect(result.classification).toBe("High Risk");
    });

    it("handles zero revenue gracefully", () => {
        const result = score({ revenue: 0, expenses: 100000, cash: 50000, debt: 500000, goal: "WC" });
        expect(result.readiness_score).toBeLessThanOrEqual(15);
        expect(result.classification).toBe("High Risk");
        expect(result.breakdown.debt.points).toBe(5); // debt ratio = 99.99 (capped)
    });

    it("returns complete breakdown structure", () => {
        const result = score({ revenue: 500000, expenses: 400000, cash: 2000000, debt: 500000, goal: "Expansion" });

        // Structure checks
        expect(result).toHaveProperty("readiness_score");
        expect(result).toHaveProperty("classification");
        expect(result).toHaveProperty("breakdown.runway.points");
        expect(result).toHaveProperty("breakdown.runway.max", 40);
        expect(result).toHaveProperty("breakdown.runway.reason");
        expect(result).toHaveProperty("breakdown.cashflow.points");
        expect(result).toHaveProperty("breakdown.cashflow.max", 30);
        expect(result).toHaveProperty("breakdown.cashflow.reason");
        expect(result).toHaveProperty("breakdown.debt.points");
        expect(result).toHaveProperty("breakdown.debt.max", 30);
        expect(result).toHaveProperty("breakdown.debt.reason");
        expect(result).toHaveProperty("calculation_summary");
        expect(result).toHaveProperty("professional_explanation");

        // Points never exceed max
        expect(result.breakdown.runway.points).toBeLessThanOrEqual(result.breakdown.runway.max);
        expect(result.breakdown.cashflow.points).toBeLessThanOrEqual(result.breakdown.cashflow.max);
        expect(result.breakdown.debt.points).toBeLessThanOrEqual(result.breakdown.debt.max);
    });

    it("score never exceeds 100", () => {
        const result = score({ revenue: 1000000, expenses: 100000, cash: 50000000, debt: 0, goal: "Expansion" });
        expect(result.readiness_score).toBeLessThanOrEqual(100);
    });
});

describe("calculateMetrics", () => {
    it("calculates stable runway when profitable", () => {
        const m = calculateMetrics({ revenue: 500000, expenses: 400000, cash: 2000000, debt: 500000, goal: "WC" });
        expect(m.burnRate).toBe(0);
        expect(m.runwayMonths).toBe("stable");
        expect(m.riskLevel).toBe("Low");
    });

    it("calculates correct burn rate and runway", () => {
        const m = calculateMetrics({ revenue: 300000, expenses: 400000, cash: 1000000, debt: 500000, goal: "WC" });
        expect(m.burnRate).toBe(100000);
        expect(m.runwayMonths).toBe(10);
    });

    it("handles zero revenue debt ratio", () => {
        const m = calculateMetrics({ revenue: 0, expenses: 100000, cash: 500000, debt: 100000, goal: "WC" });
        expect(m.debtRatio).toBe(99.99);
    });
});
