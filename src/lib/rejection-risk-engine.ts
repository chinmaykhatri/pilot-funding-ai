import { FinancialMetrics, FundingReadiness } from "./financial-calculations";

// ─── Types ─────────────────────────────────────────────────

export interface RejectionRiskItem {
    risk_title: string;
    severity: "High" | "Medium" | "Low";
    why_it_matters: string;
    how_to_improve: string;
}

export interface RejectionAnalysis {
    rejection_analysis: RejectionRiskItem[];
    overall_risk_level: "High" | "Medium" | "Low";
    approval_probability: string;
}

// ─── Helper ────────────────────────────────────────────────

function formatINR(amount: number): string {
    return `₹${amount.toLocaleString("en-IN")}`;
}

// ─── Risk Rules Database ───────────────────────────────────

interface RiskRule {
    id: string;
    check: (ctx: RiskContext) => boolean;
    severity: "High" | "Medium" | "Low";
    title: string;
    why: (ctx: RiskContext) => string;
    fix: (ctx: RiskContext) => string;
    priority: number; // lower = more critical
}

interface RiskContext {
    revenue: number;
    expenses: number;
    cash: number;
    debt: number;
    fundingAmount: number;
    surplus: number;
    annualRevenue: number;
    metrics: FinancialMetrics;
    readiness: FundingReadiness;
    goal: string;
}

const RISK_RULES: RiskRule[] = [
    // ── HIGH SEVERITY RISKS ──
    {
        id: "negative_surplus",
        check: (ctx) => ctx.surplus <= 0,
        severity: "High",
        title: "Negative or Zero Monthly Surplus",
        why: (ctx) =>
            `Monthly expenses (${formatINR(ctx.expenses)}) meet or exceed revenue (${formatINR(ctx.revenue)}), leaving no surplus for loan repayment. Indian lenders typically require demonstration of consistent repayment capacity, which is absent here.`,
        fix: () =>
            "Reduce non-essential expenses or increase revenue streams before applying. Consider presenting a 3-month projection showing improved surplus with specific cost-cutting measures.",
        priority: 1,
    },
    {
        id: "extreme_debt_ratio",
        check: (ctx) => ctx.metrics.debtRatio > 0.8,
        severity: "High",
        title: "Dangerously High Debt-to-Revenue Ratio",
        why: (ctx) =>
            `Current debt ratio of ${ctx.metrics.debtRatio.toFixed(2)} (existing debt ${formatINR(ctx.debt)} against annual revenue ${formatINR(ctx.annualRevenue)}) is well above the 0.5 threshold most banks consider acceptable. This signals over-leveraging and may trigger automatic rejection in credit scoring models.`,
        fix: () =>
            "Prioritize paying down existing debt before seeking new funding. Consider debt consolidation through schemes like CGTMSE to reduce the overall burden. Aim for a debt ratio below 0.5.",
        priority: 2,
    },
    {
        id: "critical_runway",
        check: (ctx) =>
            typeof ctx.metrics.runwayMonths === "number" && ctx.metrics.runwayMonths < 3,
        severity: "High",
        title: "Critically Low Cash Runway (<3 Months)",
        why: (ctx) =>
            `With only ${typeof ctx.metrics.runwayMonths === "number" ? ctx.metrics.runwayMonths.toFixed(1) : "0"} months of runway, the business is at imminent risk of cash depletion. Banks interpret this as a sign that the loan may be sought for survival rather than growth, which significantly reduces approval chances.`,
        fix: () =>
            "Build up at least 3–6 months of cash reserves before applying. Consider short-term measures like negotiating payment terms with vendors or collecting outstanding receivables faster.",
        priority: 3,
    },
    {
        id: "excessive_funding_request",
        check: (ctx) => ctx.fundingAmount > ctx.annualRevenue,
        severity: "High",
        title: "Funding Request Exceeds Annual Revenue",
        why: (ctx) =>
            `Requested amount of ${formatINR(ctx.fundingAmount)} exceeds the annual revenue of ${formatINR(ctx.annualRevenue)}. Indian lenders, especially PSBs, typically cap MSME loans at 1–2× annual turnover unless backed by substantial collateral or government guarantee.`,
        fix: (ctx) =>
            `Reduce the requested amount to ${formatINR(Math.round(ctx.annualRevenue * 0.5))}–${formatINR(ctx.annualRevenue)} or apply in phases. Alternatively, explore CGTMSE-backed collateral-free loans which have different assessment criteria.`,
        priority: 4,
    },
    {
        id: "zero_revenue",
        check: (ctx) => ctx.revenue <= 0,
        severity: "High",
        title: "No Reported Revenue",
        why: () =>
            "Without revenue, there is no basis for demonstrating repayment capacity. Banks require at least 6–12 months of revenue history (typically via bank statements or GST returns) before extending credit to MSMEs.",
        fix: () =>
            "Establish a track record of revenue first. For startups, consider MUDRA Shishu loans (up to ₹50,000) or incubator/angel funding that doesn't require revenue history.",
        priority: 0,
    },

    // ── MEDIUM SEVERITY RISKS ──
    {
        id: "high_debt_ratio",
        check: (ctx) => ctx.metrics.debtRatio > 0.5 && ctx.metrics.debtRatio <= 0.8,
        severity: "Medium",
        title: "Elevated Debt-to-Revenue Ratio",
        why: (ctx) =>
            `Debt ratio of ${ctx.metrics.debtRatio.toFixed(2)} is above the 0.5 comfort zone for most lenders. While not an automatic disqualifier, it may trigger additional scrutiny, higher interest rates, or requests for collateral guarantee.`,
        fix: () =>
            "Reduce outstanding debt or increase annual revenue to bring the ratio below 0.5. Provide a clear repayment timeline for existing obligations in the application.",
        priority: 5,
    },
    {
        id: "short_runway",
        check: (ctx) =>
            typeof ctx.metrics.runwayMonths === "number" &&
            ctx.metrics.runwayMonths >= 3 &&
            ctx.metrics.runwayMonths < 6,
        severity: "Medium",
        title: "Limited Cash Runway (3–6 Months)",
        why: (ctx) =>
            `A runway of ${typeof ctx.metrics.runwayMonths === "number" ? ctx.metrics.runwayMonths.toFixed(1) : "N/A"} months indicates a thin financial cushion. Lenders prefer at least 6 months of operational buffer to ensure the business can absorb temporary revenue disruptions while servicing the new loan.`,
        fix: () =>
            "Build cash reserves to cover at least 6 months of expenses. Consider delaying the loan application by 2–3 months while accumulating a larger buffer.",
        priority: 6,
    },
    {
        id: "high_burn_relative_to_revenue",
        check: (ctx) =>
            ctx.revenue > 0 && ctx.metrics.burnRate > 0 && ctx.metrics.burnRate > ctx.revenue * 0.5,
        severity: "Medium",
        title: "Burn Rate Exceeds 50% of Revenue",
        why: (ctx) =>
            `Monthly burn rate of ${formatINR(ctx.metrics.burnRate)} consumes over 50% of revenue (${formatINR(ctx.revenue)}). This leaves minimal margin for additional loan servicing costs. Lenders assess DSCR (Debt Service Coverage Ratio) and may find the current cash flow insufficient.`,
        fix: () =>
            "Identify and cut discretionary expenses. Present a concrete plan showing how the funded initiative (e.g., equipment, expansion) will reduce burn rate or increase revenue within 6–12 months.",
        priority: 7,
    },
    {
        id: "large_funding_vs_revenue",
        check: (ctx) =>
            ctx.fundingAmount > ctx.revenue * 6 && ctx.fundingAmount <= ctx.annualRevenue,
        severity: "Medium",
        title: "Funding Request is Large Relative to Monthly Revenue",
        why: (ctx) =>
            `The requested ${formatINR(ctx.fundingAmount)} represents more than 6 months of revenue. While within annual turnover, it may lead to extended scrutiny of the business plan and collateral assessment, especially from PSBs.`,
        fix: () =>
            "Provide detailed utilization plan and projected ROI in the application. If possible, phase the request into smaller tranches starting with a smaller initial loan to build lender trust.",
        priority: 8,
    },
    {
        id: "low_cash_reserve",
        check: (ctx) => ctx.cash < ctx.expenses * 2 && ctx.surplus > 0,
        severity: "Medium",
        title: "Insufficient Cash Reserves for Buffer",
        why: (ctx) =>
            `Cash balance of ${formatINR(ctx.cash)} covers less than 2 months of expenses (${formatINR(ctx.expenses)}/month). Banks view adequate cash reserves as a sign of financial prudence; low reserves suggest vulnerability to even minor operational disruptions.`,
        fix: (ctx) =>
            `Build reserves to at least ${formatINR(ctx.expenses * 3)} (3 months of expenses) before applying. This demonstrates financial discipline and provides lender confidence.`,
        priority: 9,
    },

    // ── LOW SEVERITY RISKS ──
    {
        id: "moderate_debt_ratio",
        check: (ctx) => ctx.metrics.debtRatio >= 0.2 && ctx.metrics.debtRatio <= 0.5,
        severity: "Low",
        title: "Moderate Existing Debt Obligations",
        why: (ctx) =>
            `Existing debt of ${formatINR(ctx.debt)} creates a debt ratio of ${ctx.metrics.debtRatio.toFixed(2)}. While manageable, lenders will factor in the combined EMI burden of existing and new loans when assessing affordability.`,
        fix: () =>
            "Disclose all existing obligations transparently. Present a consolidated repayment schedule showing that combined EMIs remain within 40% of monthly surplus.",
        priority: 10,
    },
    {
        id: "revenue_dependency",
        check: (ctx) =>
            ctx.revenue > 0 && ctx.surplus > 0 && ctx.surplus < ctx.revenue * 0.15,
        severity: "Low",
        title: "Thin Profit Margin (<15%)",
        why: (ctx) =>
            `Monthly surplus of ${formatINR(ctx.surplus)} represents only ${Math.round((ctx.surplus / ctx.revenue) * 100)}% of revenue. This thin margin leaves little room for loan servicing if revenue dips even slightly. Lenders may require additional collateral or guarantor.`,
        fix: () =>
            "Demonstrate plans to improve margins through cost optimization or revenue diversification. Consider applying for a smaller loan amount that requires lower EMI payments.",
        priority: 11,
    },
    {
        id: "weak_readiness_score",
        check: (ctx) =>
            ctx.readiness.classification === "Weak" || ctx.readiness.classification === "High Risk",
        severity: "Medium",
        title: `Weak Funding Readiness Classification`,
        why: (ctx) =>
            `Overall readiness score of ${ctx.readiness.readiness_score}/100 (${ctx.readiness.classification}) indicates fundamental financial weaknesses. While banks don't use this exact metric, the underlying factors (runway, cash flow, debt) are individually assessed and collectively paint a concerning picture.`,
        fix: () =>
            "Focus on improving the weakest factor in the breakdown. Even improving one factor (e.g., lowering debt ratio from >0.5 to <0.3) can materially change the lender's assessment.",
        priority: 12,
    },
];

// ─── Main Engine ───────────────────────────────────────────

export function analyzeRejectionRisks(
    metrics: FinancialMetrics,
    readiness: FundingReadiness,
    revenue: number,
    expenses: number,
    cash: number,
    debt: number,
    fundingAmount: number,
    goal: string
): RejectionAnalysis {
    const surplus = revenue - expenses;
    const annualRevenue = revenue * 12;

    const ctx: RiskContext = {
        revenue,
        expenses,
        cash,
        debt,
        fundingAmount,
        surplus,
        annualRevenue,
        metrics,
        readiness,
        goal,
    };

    // Evaluate all rules, collect triggered risks
    const triggered = RISK_RULES.filter((rule) => rule.check(ctx))
        .map((rule) => ({
            risk_title: rule.title,
            severity: rule.severity,
            why_it_matters: rule.why(ctx),
            how_to_improve: rule.fix(ctx),
            priority: rule.priority,
        }))
        .sort((a, b) => a.priority - b.priority);

    // Select top 3 most critical
    const topRisks: RejectionRiskItem[] = triggered.slice(0, 3).map(({ priority, ...rest }) => rest);

    // If fewer than 3 risks triggered, add a positive note
    if (topRisks.length === 0) {
        topRisks.push({
            risk_title: "Strong Financial Profile",
            severity: "Low",
            why_it_matters:
                "No major rejection risks identified based on the current financial data. The business demonstrates adequate surplus, manageable debt, and sufficient runway.",
            how_to_improve:
                "Ensure all supporting documents (GST returns, bank statements, ITR for 2+ years, Udyam registration) are ready before submitting. A well-prepared application package significantly improves approval speed.",
        });
    }

    // Determine overall risk level
    const highCount = topRisks.filter((r) => r.severity === "High").length;
    const medCount = topRisks.filter((r) => r.severity === "Medium").length;

    let overall_risk_level: "High" | "Medium" | "Low";
    if (highCount >= 2) overall_risk_level = "High";
    else if (highCount >= 1 || medCount >= 2) overall_risk_level = "Medium";
    else overall_risk_level = "Low";

    // Estimate approval probability (qualitative)
    let approval_probability: string;
    if (overall_risk_level === "High") {
        approval_probability = "Low — significant financial concerns may lead to rejection or additional collateral requirements";
    } else if (overall_risk_level === "Medium") {
        approval_probability = "Moderate — approval possible with strong documentation and possibly a guarantor";
    } else {
        approval_probability = "Good — financial profile supports the application; focus on documentation completeness";
    }

    return {
        rejection_analysis: topRisks,
        overall_risk_level,
        approval_probability,
    };
}
