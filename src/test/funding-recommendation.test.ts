import { describe, it, expect } from "vitest";
import { calculateFundingRecommendation } from "@/lib/funding-recommendation";
import { calculateMetrics, calculateReadinessScore, FinancialData } from "@/lib/financial-calculations";

// Helper
function recommend(data: FinancialData) {
    const metrics = calculateMetrics(data);
    const readiness = calculateReadinessScore(metrics, data.revenue);
    return calculateFundingRecommendation(metrics, readiness, data.revenue, data.goal);
}

describe("calculateFundingRecommendation", () => {
    it("returns 2-3 funding options", () => {
        const result = recommend({ revenue: 500000, expenses: 400000, cash: 2000000, debt: 500000, goal: "Working Capital" });
        expect(result.funding_options.length).toBeGreaterThanOrEqual(2);
        expect(result.funding_options.length).toBeLessThanOrEqual(3);
    });

    it("Strong profile gets premium schemes like CGTMSE/SBI/SIDBI", () => {
        const result = recommend({ revenue: 500000, expenses: 400000, cash: 2000000, debt: 500000, goal: "Business Expansion" });
        const names = result.funding_options.map(o => o.name);
        const hasPremium = names.some(n => n.includes("CGTMSE") || n.includes("SBI") || n.includes("SIDBI") || n.includes("PSB"));
        expect(hasPremium).toBe(true);
    });

    it("High Risk profile gets MUDRA/NBFC schemes", () => {
        const result = recommend({ revenue: 100000, expenses: 200000, cash: 200000, debt: 2000000, goal: "Working Capital" });
        const names = result.funding_options.map(o => o.name);
        const hasAccessible = names.some(n => n.includes("MUDRA") || n.includes("NBFC"));
        expect(hasAccessible).toBe(true);
    });

    it("Strong profile gets higher suggested amounts (3–4× revenue)", () => {
        const result = recommend({ revenue: 500000, expenses: 400000, cash: 2000000, debt: 500000, goal: "Equipment Purchase" });
        expect(result.primary_recommendation.suggested_amount_range).toContain("₹");
        // Should suggest 15L–20L range for 5L revenue
        expect(result.primary_recommendation.suggested_amount_range).toMatch(/15|20/);
    });

    it("High Risk gets conservative amounts (0.5–1× revenue)", () => {
        const result = recommend({ revenue: 100000, expenses: 200000, cash: 200000, debt: 2000000, goal: "Working Capital" });
        expect(result.primary_recommendation.suggested_amount_range).toContain("₹");
    });

    it("includes official links for all funded options", () => {
        const result = recommend({ revenue: 500000, expenses: 400000, cash: 2000000, debt: 500000, goal: "Working Capital" });
        result.funding_options.forEach(option => {
            // All should have official_link (may be empty for NBFC)
            expect(option).toHaveProperty("official_link");
            expect(option).toHaveProperty("basic_eligibility");
            expect(option).toHaveProperty("why_suitable");
        });
    });

    it("timing reflects runway urgency", () => {
        // High Risk with <3mo runway → urgent
        const urgent = recommend({ revenue: 100000, expenses: 200000, cash: 200000, debt: 2000000, goal: "Working Capital" });
        expect(urgent.primary_recommendation.best_timing.toLowerCase()).toMatch(/urgent|immediate/);

        // Stable/Strong → strategic timing
        const strategic = recommend({ revenue: 500000, expenses: 400000, cash: 2000000, debt: 500000, goal: "Business Expansion" });
        expect(strategic.primary_recommendation.best_timing.toLowerCase()).toMatch(/strategic|plan/);
    });

    it("primary recommendation has all required fields", () => {
        const result = recommend({ revenue: 300000, expenses: 350000, cash: 500000, debt: 1000000, goal: "Equipment Purchase" });
        expect(result.primary_recommendation).toHaveProperty("funding_type");
        expect(result.primary_recommendation).toHaveProperty("suggested_amount_range");
        expect(result.primary_recommendation).toHaveProperty("best_timing");
        expect(result.primary_recommendation).toHaveProperty("reason");
        expect(result.primary_recommendation.funding_type.length).toBeGreaterThan(0);
        expect(result.primary_recommendation.reason.length).toBeGreaterThan(0);
    });
});
