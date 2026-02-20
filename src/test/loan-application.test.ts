import { describe, it, expect } from "vitest";
import { generateLoanApplication } from "@/lib/loan-application-generator";

describe("generateLoanApplication", () => {
    const profitableInput = {
        businessName: "ABC Enterprises",
        industry: "Manufacturing",
        revenue: 500000,
        expenses: 350000,
        cash: 2000000,
        debt: 1000000,
        fundingAmount: 2500000,
        fundingPurpose: "Equipment purchase",
    };

    const deficitInput = {
        businessName: "XYZ Services",
        industry: "IT Services",
        revenue: 200000,
        expenses: 250000,
        cash: 300000,
        debt: 500000,
        fundingAmount: 500000,
        fundingPurpose: "Working capital",
    };

    it("calculates annual revenue correctly", () => {
        const app = generateLoanApplication(profitableInput);
        expect(app.calculations.annualRevenue).toBe(6000000); // 500000 * 12
    });

    it("calculates monthly surplus for profitable business", () => {
        const app = generateLoanApplication(profitableInput);
        expect(app.calculations.monthlySurplus).toBe(150000); // 500000 - 350000
        expect(app.calculations.isDeficit).toBe(false);
    });

    it("detects deficit correctly", () => {
        const app = generateLoanApplication(deficitInput);
        expect(app.calculations.monthlySurplus).toBe(-50000); // 200000 - 250000
        expect(app.calculations.isDeficit).toBe(true);
    });

    it("calculates estimated EMI as 40% of surplus for profitable business", () => {
        const app = generateLoanApplication(profitableInput);
        // 40% of 150000 = 60000
        expect(app.calculations.estimatedEMI).toContain("60,000");
    });

    it("returns 'Subject to financial restructuring' for deficit", () => {
        const app = generateLoanApplication(deficitInput);
        expect(app.calculations.estimatedEMI).toBe("Subject to financial restructuring");
    });

    it("includes all 5 sections", () => {
        const app = generateLoanApplication(profitableInput);
        expect(app.sections.businessIntroduction).toBeTruthy();
        expect(app.sections.fundingRequirement).toBeTruthy();
        expect(app.sections.financialSummary).toBeTruthy();
        expect(app.sections.repaymentCapability).toBeTruthy();
        expect(app.sections.requestForConsideration).toBeTruthy();
    });

    it("includes business name and industry in introduction", () => {
        const app = generateLoanApplication(profitableInput);
        expect(app.sections.businessIntroduction).toContain("ABC Enterprises");
        expect(app.sections.businessIntroduction).toContain("Manufacturing");
    });

    it("includes funding amount in subject line", () => {
        const app = generateLoanApplication(profitableInput);
        expect(app.subject).toContain("25,00,000");
    });

    it("generates full letter text with formal structure", () => {
        const app = generateLoanApplication(profitableInput);
        expect(app.fullLetterText).toContain("Dear Sir/Madam");
        expect(app.fullLetterText).toContain("Yours faithfully");
        expect(app.fullLetterText).toContain("Authorized Signatory");
        expect(app.fullLetterText).toContain("BUSINESS INTRODUCTION");
        expect(app.fullLetterText).toContain("FUNDING REQUIREMENT");
        expect(app.fullLetterText).toContain("FINANCIAL SUMMARY");
        expect(app.fullLetterText).toContain("REPAYMENT CAPABILITY");
        expect(app.fullLetterText).toContain("REQUEST FOR CONSIDERATION");
    });

    it("handles empty business name gracefully", () => {
        const app = generateLoanApplication({ ...profitableInput, businessName: "" });
        expect(app.businessName).toBe("[Business Name]");
        expect(app.fullLetterText).toContain("[Business Name]");
    });

    it("mentions deficit in repayment section for unprofitable business", () => {
        const app = generateLoanApplication(deficitInput);
        expect(app.sections.repaymentCapability).toMatch(/break-even|deficit/i);
    });
});
