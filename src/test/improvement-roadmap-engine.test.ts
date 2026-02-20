import { describe, it, expect } from "vitest";
import { generateFinancialRoadmap } from "@/lib/improvement-roadmap-engine";
import { calculateMetrics, calculateReadinessScore } from "@/lib/financial-calculations";

// Helper
function roadmap(overrides: {
    revenue?: number;
    expenses?: number;
    cash?: number;
    debt?: number;
    goal?: string;
}) {
    const defaults = {
        revenue: 500000,
        expenses: 350000,
        cash: 2000000,
        debt: 500000,
        goal: "Working Capital",
    };
    const d = { ...defaults, ...overrides };
    const metrics = calculateMetrics(d);
    const readiness = calculateReadinessScore(metrics, d.revenue);
    return generateFinancialRoadmap(
        metrics, readiness, d.revenue, d.expenses, d.cash, d.debt, d.goal
    );
}

describe("generateFinancialRoadmap", () => {
    it("returns exactly 3 improvement actions", () => {
        const result = roadmap({});
        expect(result.financial_roadmap.length).toBe(3);
    });

    it("returns readiness_summary", () => {
        const result = roadmap({});
        expect(result.readiness_summary).toBeTruthy();
        expect(result.readiness_summary.length).toBeGreaterThan(10);
    });

    it("each action has all required fields", () => {
        const result = roadmap({});
        for (const action of result.financial_roadmap) {
            expect(action.priority).toBeTruthy();
            expect(["High", "Medium", "Low"]).toContain(action.priority);
            expect(action.action_title).toBeTruthy();
            expect(action.what_to_do.length).toBeGreaterThan(20);
            expect(action.why_it_matters.length).toBeGreaterThan(20);
            expect(action.expected_impact.length).toBeGreaterThan(10);
        }
    });

    it("deficit profile gets High priority deficit elimination action", () => {
        const result = roadmap({ revenue: 200000, expenses: 300000 });
        const deficitAction = result.financial_roadmap.find(a =>
            a.action_title.toLowerCase().includes("deficit") ||
            a.action_title.toLowerCase().includes("cash flow")
        );
        expect(deficitAction).toBeTruthy();
        expect(deficitAction!.priority).toBe("High");
    });

    it("high debt profile gets debt reduction action", () => {
        const result = roadmap({ debt: 10000000, revenue: 500000 });
        const debtAction = result.financial_roadmap.find(a =>
            a.action_title.toLowerCase().includes("debt")
        );
        expect(debtAction).toBeTruthy();
        expect(debtAction!.priority).toBe("High");
    });

    it("healthy profile gets Low/Medium priority actions", () => {
        const result = roadmap({
            revenue: 1000000,
            expenses: 500000,
            cash: 5000000,
            debt: 200000,
        });
        const highActions = result.financial_roadmap.filter(a => a.priority === "High");
        expect(highActions.length).toBe(0);
    });

    it("low cash profile includes liquidity or runway recommendation", () => {
        const result = roadmap({ cash: 400000, expenses: 350000 });
        const bufferAction = result.financial_roadmap.find(a =>
            a.action_title.toLowerCase().includes("buffer") ||
            a.action_title.toLowerCase().includes("reserve") ||
            a.action_title.toLowerCase().includes("runway") ||
            a.action_title.toLowerCase().includes("liquidity")
        );
        expect(bufferAction).toBeTruthy();
    });

    it("readiness summary reflects score classification", () => {
        const strong = roadmap({ revenue: 1000000, expenses: 500000, cash: 5000000, debt: 200000 });
        expect(strong.readiness_summary).toMatch(/strong|good/i);

        const weak = roadmap({ revenue: 200000, expenses: 300000, cash: 50000, debt: 5000000 });
        expect(weak.readiness_summary).toMatch(/high risk|weak|significant/i);
    });

    it("improvement suggestions contain INR amounts where relevant", () => {
        const result = roadmap({ revenue: 200000, expenses: 300000, debt: 5000000 });
        const hasINR = result.financial_roadmap.some(a =>
            a.what_to_do.includes("₹") || a.expected_impact.includes("₹")
        );
        expect(hasINR).toBe(true);
    });
});
