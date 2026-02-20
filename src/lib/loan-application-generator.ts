// ─── Types ─────────────────────────────────────────────────

export interface LoanApplicationInput {
    businessName: string;
    industry: string;
    revenue: number;       // monthly
    expenses: number;      // monthly
    cash: number;
    debt: number;
    fundingAmount: number;
    fundingPurpose: string;
}

export interface FinancialCalculations {
    annualRevenue: number;
    monthlySurplus: number;
    isDeficit: boolean;
    estimatedEMI: string;
}

export interface FormalLoanApplication {
    date: string;
    subject: string;
    sections: {
        businessIntroduction: string;
        fundingRequirement: string;
        financialSummary: string;
        repaymentCapability: string;
        requestForConsideration: string;
    };
    calculations: FinancialCalculations;
    businessName: string;
    fullLetterText: string;
}

// ─── Helpers ───────────────────────────────────────────────

function formatINR(amount: number): string {
    return `₹${amount.toLocaleString("en-IN")}`;
}

function getTodayFormatted(): string {
    const d = new Date();
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
    ];
    return `${d.getDate()} ${months[d.getMonth()]}, ${d.getFullYear()}`;
}

// ─── Generator ─────────────────────────────────────────────

export function generateLoanApplication(input: LoanApplicationInput): FormalLoanApplication {
    const {
        businessName,
        industry,
        revenue,
        expenses,
        cash,
        debt,
        fundingAmount,
        fundingPurpose,
    } = input;

    // ── Financial Calculations ──
    const annualRevenue = revenue * 12;
    const monthlySurplus = revenue - expenses;
    const isDeficit = monthlySurplus <= 0;
    const estimatedEMI = isDeficit
        ? "Subject to financial restructuring"
        : formatINR(Math.round(monthlySurplus * 0.4));

    const calculations: FinancialCalculations = {
        annualRevenue,
        monthlySurplus,
        isDeficit,
        estimatedEMI,
    };

    const date = getTodayFormatted();
    const subject = `Application for Business Loan of ${formatINR(fundingAmount)}`;

    // ── Section 1: Business Introduction ──
    const businessIntroduction = `We, ${businessName || "[Business Name]"}, are an enterprise operating in the ${industry || "[Industry]"} sector. Our business is seeking financial assistance to support operational requirements and growth objectives. This application is submitted to request your esteemed institution's consideration for a business loan facility to strengthen our working operations and future plans.`;

    // ── Section 2: Funding Requirement ──
    const fundingRequirement = `We hereby request a business loan of ${formatINR(fundingAmount)} for the purpose of ${fundingPurpose || "[Purpose]"}. This funding will be utilized exclusively for the stated purpose and is expected to contribute positively to the operational efficiency and revenue growth of the business.`;

    // ── Section 3: Financial Summary ──
    const surplusStatement = isDeficit
        ? `The business currently operates at break-even or deficit, with monthly expenses of ${formatINR(expenses)} against revenue of ${formatINR(revenue)}.`
        : `The business generates a monthly surplus of ${formatINR(monthlySurplus)} after meeting all operational expenses.`;

    const financialSummary = `The following figures represent the current financial position of the business:

• Annual Revenue: ${formatINR(annualRevenue)}
• Monthly Revenue: ${formatINR(revenue)}
• Monthly Expenses: ${formatINR(expenses)}
• Monthly Surplus: ${isDeficit ? "Business currently operates at break-even or deficit" : formatINR(monthlySurplus)}
• Existing Debt: ${formatINR(debt)}
• Current Cash Balance: ${formatINR(cash)}

${surplusStatement} These figures are based on actual operational data and reflect the genuine financial health of the business.`;

    // ── Section 4: Repayment Capability ──
    let repaymentCapability: string;
    if (isDeficit) {
        repaymentCapability = `At present, the business operates at or near break-even. Should the requested funding of ${formatINR(fundingAmount)} be deployed as planned for ${fundingPurpose.toLowerCase()}, we anticipate improved revenue performance. Repayment structuring may need to accommodate the current cash flow position, and we are open to discussing flexible repayment terms with your institution.`;
    } else {
        const debtToRevenue = debt > 0 ? ` Current existing debt of ${formatINR(debt)} is being serviced from operational cash flow.` : "";
        repaymentCapability = `Based on the current financial performance, the business generates a monthly surplus of ${formatINR(monthlySurplus)}. At an estimated comfortable EMI of ${estimatedEMI} (approximately 40% of monthly surplus), the business expects to comfortably service loan repayments while maintaining adequate operational cash reserves of ${formatINR(cash)}.${debtToRevenue}`;
    }

    // ── Section 5: Request for Consideration ──
    const requestForConsideration = `We kindly request your esteemed institution to consider this loan application favorably. We are willing to provide any additional documentation, financial statements, or information as may be required during the evaluation process. We look forward to a positive response and are available to discuss the application at your earliest convenience.`;

    const sections = {
        businessIntroduction,
        fundingRequirement,
        financialSummary,
        repaymentCapability,
        requestForConsideration,
    };

    // ── Full Letter Text (for copy/print) ──
    const fullLetterText = `Date: ${date}

To
The Branch Manager
[Bank / Financial Institution Name]
[Branch Address]

Subject: ${subject}

Dear Sir/Madam,

1. BUSINESS INTRODUCTION

${businessIntroduction}

2. FUNDING REQUIREMENT

${fundingRequirement}

3. FINANCIAL SUMMARY

${financialSummary}

4. REPAYMENT CAPABILITY

${repaymentCapability}

5. REQUEST FOR CONSIDERATION

${requestForConsideration}

Thank you for your time and consideration.

Yours faithfully,

For ${businessName || "[Business Name]"}
Authorized Signatory
Name: ____________
Contact: ____________`;

    return {
        date,
        subject,
        sections,
        calculations,
        businessName: businessName || "[Business Name]",
        fullLetterText,
    };
}
