import { FinancialMetrics, FundingReadiness } from "./financial-calculations";

// ─── Types ─────────────────────────────────────────────────

export interface RoadmapAction {
    priority: "High" | "Medium" | "Low";
    action_title: string;
    what_to_do: string;
    why_it_matters: string;
    expected_impact: string;
}

export interface FinancialRoadmap {
    financial_roadmap: RoadmapAction[];
    readiness_summary: string;
}

// ─── Helper ────────────────────────────────────────────────

function formatINR(amount: number): string {
    return `₹${amount.toLocaleString("en-IN")}`;
}

// ─── Improvement Rules Database ────────────────────────────

interface ImprovementRule {
    id: string;
    check: (ctx: ImprovementContext) => boolean;
    priority: "High" | "Medium" | "Low";
    title: string;
    whatToDo: (ctx: ImprovementContext) => string;
    whyItMatters: (ctx: ImprovementContext) => string;
    expectedImpact: (ctx: ImprovementContext) => string;
    weight: number; // lower = more urgent
}

interface ImprovementContext {
    revenue: number;
    expenses: number;
    cash: number;
    debt: number;
    surplus: number;
    annualRevenue: number;
    metrics: FinancialMetrics;
    readiness: FundingReadiness;
    goal: string;
}

const IMPROVEMENT_RULES: ImprovementRule[] = [
    // ── HIGH PRIORITY ──
    {
        id: "eliminate_deficit",
        check: (ctx) => ctx.surplus <= 0,
        priority: "High",
        title: "Eliminate Monthly Cash Flow Deficit",
        whatToDo: (ctx) =>
            `Reduce monthly expenses from ${formatINR(ctx.expenses)} to below ${formatINR(ctx.revenue)} within 60 days. Identify the top 3 non-essential expense categories and negotiate 10–15% reductions with vendors. Consider renegotiating rent, switching raw material suppliers, or deferring discretionary spending.`,
        whyItMatters: () =>
            "Lenders evaluate DSCR (Debt Service Coverage Ratio) as a primary approval criterion. A negative surplus means DSCR < 1, which is an automatic red flag in most Indian PSB and NBFC credit models. No lender will extend credit if the borrower cannot demonstrate operating surplus.",
        expectedImpact: () =>
            "Achieving even a small positive surplus (₹10,000–₹30,000/month) moves the DSCR above 1.0. This single change can shift the readiness classification from 'High Risk' toward 'Weak', opening up MUDRA and NBFC lending options.",
        weight: 1,
    },
    {
        id: "reduce_extreme_debt",
        check: (ctx) => ctx.metrics.debtRatio > 0.8,
        priority: "High",
        title: "Reduce Debt-to-Revenue Ratio Below 0.5",
        whatToDo: (ctx) => {
            const targetDebt = Math.round(ctx.annualRevenue * 0.5);
            const reductionNeeded = Math.round(ctx.debt - targetDebt);
            return `Pay down at least ${formatINR(reductionNeeded)} of existing debt (from ${formatINR(ctx.debt)} to ${formatINR(targetDebt)}). Prioritize high-interest unsecured debt first. Consider consolidating smaller loans through a single CGTMSE-backed facility at lower interest rates.`;
        },
        whyItMatters: (ctx) =>
            `Current debt ratio of ${ctx.metrics.debtRatio.toFixed(2)} is more than double the 0.5 threshold that most banks consider acceptable. High leverage signals over-borrowing and reduces the lender's confidence in repayment. Credit scoring models penalize ratios above 0.5 heavily.`,
        expectedImpact: () =>
            "Bringing the ratio below 0.5 can improve readiness score by 15–25 points. Lenders view sub-0.5 ratios as manageable, which unlocks access to PSB term loans and SBI MSME schemes with lower interest rates.",
        weight: 2,
    },
    {
        id: "extend_critical_runway",
        check: (ctx) =>
            typeof ctx.metrics.runwayMonths === "number" && ctx.metrics.runwayMonths < 3,
        priority: "High",
        title: "Build Cash Reserves to Extend Runway",
        whatToDo: (ctx) => {
            const targetCash = ctx.expenses * 6;
            return `Increase cash reserves from ${formatINR(ctx.cash)} to at least ${formatINR(targetCash)} (6 months of expenses). Accelerate receivable collections — offer 2–3% early payment discounts to key clients. Hold off on non-essential capital expenditure for 2–3 months while building the buffer.`;
        },
        whyItMatters: () =>
            "Banks interpret short runway (<3 months) as a sign that the loan application is driven by survival rather than growth. RBI guidelines encourage lenders to assess liquidity buffers as part of NPA risk assessment. Adequate reserves demonstrate financial prudence.",
        expectedImpact: () =>
            "Extending runway to 6+ months improves the readiness score by 20–35 points and shifts classification from 'High Risk' toward 'Moderate'. This makes the business eligible for SIDBI and SBI MSME term loans.",
        weight: 3,
    },
    {
        id: "build_revenue_track",
        check: (ctx) => ctx.revenue > 0 && ctx.annualRevenue < 500000,
        priority: "High",
        title: "Establish Minimum Revenue Track Record",
        whatToDo: () =>
            "Ensure at least 6 consecutive months of bank account credits demonstrating consistent revenue. Register on GST and file returns for at least 2 quarters. Obtain Udyam registration (free) to qualify for MSME-specific schemes. These are the baseline documentary requirements for most lenders.",
        whyItMatters: () =>
            "Indian lenders typically require 6–12 months of bank statements showing consistent revenue inflows. For MUDRA loans, Udyam registration is mandatory. GST returns serve as independent verification of turnover that lenders cross-reference with bank statements.",
        expectedImpact: () =>
            "Meeting these documentary baselines makes the business eligible for MUDRA Shishu (up to ₹50,000) and Kishore (up to ₹5 lakh) categories. It also enables access to PSB Loans in 59 Minutes portal.",
        weight: 4,
    },

    // ── MEDIUM PRIORITY ──
    {
        id: "improve_surplus_margin",
        check: (ctx) =>
            ctx.surplus > 0 && ctx.surplus < ctx.revenue * 0.2 && ctx.revenue > 0,
        priority: "Medium",
        title: "Improve Operating Surplus to 20%+ of Revenue",
        whatToDo: (ctx) => {
            const currentMargin = Math.round((ctx.surplus / ctx.revenue) * 100);
            const targetSurplus = Math.round(ctx.revenue * 0.2);
            return `Current surplus margin is ${currentMargin}% (${formatINR(ctx.surplus)}/month). Target: increase to ${formatINR(targetSurplus)}/month (20%). Review cost structure — negotiate bulk purchase discounts, optimize staffing efficiency, and eliminate underperforming product lines or services.`;
        },
        whyItMatters: () =>
            "A surplus margin of 20%+ signals operational efficiency and provides adequate headroom for loan EMI payments. Lenders calculate whether the EMI (typically 40% of surplus) leaves enough buffer for operational continuity.",
        expectedImpact: () =>
            "A 20% margin allows comfortable EMI servicing while maintaining business operations. This can improve approval probability from 'Moderate' to 'Good' and may qualify for lower interest rates on MSME loans.",
        weight: 5,
    },
    {
        id: "reduce_elevated_debt",
        check: (ctx) => ctx.metrics.debtRatio > 0.5 && ctx.metrics.debtRatio <= 0.8,
        priority: "Medium",
        title: "Bring Debt Ratio into Comfortable Range",
        whatToDo: (ctx) => {
            const targetDebt = Math.round(ctx.annualRevenue * 0.3);
            return `Reduce outstanding debt from ${formatINR(ctx.debt)} toward ${formatINR(targetDebt)} (ratio of 0.3). Focus on clearing the highest-interest obligations first. If debt is across multiple lenders, consolidate under one facility to improve the debt profile on CIBIL.`;
        },
        whyItMatters: () =>
            "A debt ratio between 0.5–0.8 triggers enhanced scrutiny from lenders. While not an automatic rejection, it reduces the sanctioned loan amount and may result in higher interest rates or collateral requirements.",
        expectedImpact: () =>
            "Reducing to below 0.3 positions the business for premium lending products like SBI MSME and SIDBI Finance, which offer interest rates 2–3% lower than high-ratio borrowers.",
        weight: 6,
    },
    {
        id: "build_liquidity_buffer",
        check: (ctx) =>
            ctx.cash < ctx.expenses * 3 && ctx.surplus > 0 && ctx.cash >= ctx.expenses * 1,
        priority: "Medium",
        title: "Build 3-Month Liquidity Buffer",
        whatToDo: (ctx) => {
            const target = ctx.expenses * 3;
            const gap = target - ctx.cash;
            return `Accumulate an additional ${formatINR(gap)} in reserves over the next 2–3 months to reach ${formatINR(target)} (3× monthly expenses). Set aside ${formatINR(Math.round(gap / 3))}/month from surplus into a fixed deposit or liquid fund earmarked as an operating reserve.`;
        },
        whyItMatters: () =>
            "Lenders evaluate liquid reserves as insurance against revenue disruptions. A 3-month buffer demonstrates that the business can continue servicing loan EMIs even during seasonal slowdowns or client payment delays.",
        expectedImpact: () =>
            "A 3-month buffer improves the runway score component and can add 10–15 points to overall readiness. It also reduces the lender's requirement for additional collateral or personal guarantee.",
        weight: 7,
    },
    {
        id: "extend_moderate_runway",
        check: (ctx) =>
            typeof ctx.metrics.runwayMonths === "number" &&
            ctx.metrics.runwayMonths >= 3 &&
            ctx.metrics.runwayMonths < 6,
        priority: "Medium",
        title: "Extend Runway to 6+ Months",
        whatToDo: (ctx) => {
            const additionalNeeded = ctx.expenses * 6 - ctx.cash;
            return `Accumulate an additional ${formatINR(Math.max(0, additionalNeeded))} to reach 6 months of expense coverage. Implement weekly cash flow monitoring. Consider offering early payment incentives to top 5 clients to accelerate receivable conversion by 15–20 days.`;
        },
        whyItMatters: () =>
            "A runway of 3–6 months is borderline acceptable. Extending to 6+ months moves the assessment from 'adequate' to 'comfortable', which directly influences the loan amount sanctioned and interest rate offered.",
        expectedImpact: () =>
            "Moving from 4-month to 6-month runway can improve the readiness score by 10–15 points and shift classification from 'Weak' to 'Moderate', significantly improving approval odds.",
        weight: 8,
    },
    {
        id: "reduce_high_burn",
        check: (ctx) =>
            ctx.revenue > 0 && ctx.metrics.burnRate > 0 && ctx.metrics.burnRate > ctx.revenue * 0.3,
        priority: "Medium",
        title: "Reduce Operating Burn Rate",
        whatToDo: (ctx) => {
            const targetBurn = Math.round(ctx.revenue * 0.2);
            return `Bring net burn rate from ${formatINR(ctx.metrics.burnRate)}/month down to ${formatINR(targetBurn)}/month. Conduct a line-by-line expense audit: identify the top 5 cost categories, benchmark each against industry averages, and target a 15–25% reduction in the largest 2–3 categories.`;
        },
        whyItMatters: () =>
            "High burn relative to revenue signals operational inefficiency. Lenders analyze whether the business model is sustainable — high burn erodes cash reserves and reduces the available surplus for debt servicing.",
        expectedImpact: () =>
            "A 20–30% burn reduction directly increases monthly surplus, improves DSCR, and extends runway. This holistically strengthens the financial profile across multiple lending assessment criteria.",
        weight: 9,
    },

    // ── LOW PRIORITY ──
    {
        id: "prepare_documentation",
        check: (ctx) => ctx.surplus > 0 && ctx.readiness.readiness_score >= 40,
        priority: "Low",
        title: "Prepare Complete Loan Documentation Package",
        whatToDo: () =>
            "Compile: (1) Last 12 months bank statements, (2) ITR for 2+ years, (3) GST returns for 4+ quarters, (4) Udyam registration certificate, (5) Business PAN and Aadhaar, (6) Current office/factory address proof, (7) Audited/projected financials. Having these ready eliminates the most common cause of loan processing delays.",
        whyItMatters: () =>
            "Incomplete documentation is the #1 cause of MSME loan delays in India. PSBs report that 40–60% of initial applications are returned due to missing documents. A complete package demonstrates professionalism and speeds up the credit appraisal process.",
        expectedImpact: () =>
            "A complete documentation package reduces processing time from 30–45 days to 7–15 days. It also creates a positive first impression with the credit officer, which can influence subjective assessment components.",
        weight: 10,
    },
    {
        id: "improve_cibil",
        check: (ctx) => ctx.debt > 0 && ctx.surplus > 0,
        priority: "Low",
        title: "Strengthen CIBIL/Credit Profile",
        whatToDo: () =>
            "Ensure all existing EMI payments are up to date with zero delays. Pay credit card balances in full each month. Avoid making multiple loan inquiries within 30 days (each inquiry reduces CIBIL score by 5–10 points). Request a CIBIL report and dispute any errors. Target a minimum score of 700 for PSB loans or 650 for MUDRA.",
        whyItMatters: () =>
            "CIBIL score is a go/no-go criterion for most Indian lenders. PSBs typically require 700+ for unsecured business loans. Even MUDRA loans check CIBIL for scores below 500 as a disqualification threshold.",
        expectedImpact: () =>
            "A CIBIL score improvement from 650 to 750 can reduce offered interest rates by 1–2% and increase the maximum sanctioned amount by 20–30%. It also qualifies the business for collateral-free lending under CGTMSE.",
        weight: 11,
    },
    {
        id: "diversify_revenue",
        check: (ctx) =>
            ctx.surplus > 0 && ctx.readiness.readiness_score >= 60 && ctx.revenue > 0,
        priority: "Low",
        title: "Diversify Revenue Streams for Stability",
        whatToDo: () =>
            "Reduce dependency on the top 1–2 clients to below 40% of total revenue. Add 2–3 new smaller clients or introduce a complementary product/service line. Document the revenue diversification in the loan application to demonstrate reduced concentration risk.",
        whyItMatters: () =>
            "Revenue concentration risk is a key assessment factor for large loans. If 60%+ of revenue comes from one client, the loss of that client could make the loan unserviceable. Lenders view diversified revenue as a stability indicator.",
        expectedImpact: () =>
            "Demonstrating diversified revenue can increase the sanctioned amount by 10–15% and position the application favorably for larger loans (₹25 lakh+) where lenders conduct deeper revenue analysis.",
        weight: 12,
    },
];

// ─── Main Engine ───────────────────────────────────────────

export function generateFinancialRoadmap(
    metrics: FinancialMetrics,
    readiness: FundingReadiness,
    revenue: number,
    expenses: number,
    cash: number,
    debt: number,
    goal: string
): FinancialRoadmap {
    const surplus = revenue - expenses;
    const annualRevenue = revenue * 12;

    const ctx: ImprovementContext = {
        revenue,
        expenses,
        cash,
        debt,
        surplus,
        annualRevenue,
        metrics,
        readiness,
        goal,
    };

    // Evaluate all rules, collect triggered improvements
    const triggered = IMPROVEMENT_RULES.filter((rule) => rule.check(ctx))
        .map((rule) => ({
            priority: rule.priority,
            action_title: rule.title,
            what_to_do: rule.whatToDo(ctx),
            why_it_matters: rule.whyItMatters(ctx),
            expected_impact: rule.expectedImpact(ctx),
            weight: rule.weight,
        }))
        .sort((a, b) => a.weight - b.weight);

    // Select exactly 3 most impactful
    const topActions: RoadmapAction[] = triggered
        .slice(0, 3)
        .map(({ weight, ...rest }) => rest);

    // If fewer than 3, pad with general advice
    while (topActions.length < 3) {
        const fallbacks: RoadmapAction[] = [
            {
                priority: "Low",
                action_title: "Maintain Financial Discipline",
                what_to_do:
                    "Continue tracking monthly revenue vs expenses and maintain current surplus levels. Build a 6-month rolling financial report to demonstrate consistency to lenders.",
                why_it_matters:
                    "Lenders value consistency and financial discipline. A stable 6-month track record of positive cash flow is one of the strongest indicators of creditworthiness for MSMEs.",
                expected_impact:
                    "A proven track record of 6+ months of consistent surplus can improve approval probability and may qualify the business for pre-approved loan offers from relationship banks.",
            },
            {
                priority: "Low",
                action_title: "Build Banking Relationship",
                what_to_do:
                    "Route all business transactions through one primary current account. Maintain minimum balance requirements. Approach the relationship manager for a credit facility discussion before formally applying.",
                why_it_matters:
                    "Banks prefer lending to existing account holders with visible transaction history. An active current account with consistent deposits is strong evidence of genuine business activity.",
                expected_impact:
                    "Existing customers can access faster processing, reduced documentation, and pre-approved loan offers. Some PSBs offer 0.25–0.5% interest rate concessions to loyal customers.",
            },
            {
                priority: "Low",
                action_title: "Register for Government MSME Benefits",
                what_to_do:
                    "Complete Udyam registration (free, online at udyamregistration.gov.in). Enroll for NSIC, GeM marketplace registration, and explore PMEGP subsidy if applicable. These registrations unlock exclusive MSME lending schemes.",
                why_it_matters:
                    "Udyam registration is a prerequisite for CGTMSE guarantee (collateral-free loans up to ₹5 crore), MUDRA loans, and PSB MSME priority sector lending. Without it, the business misses out on the most favorable lending terms available.",
                expected_impact:
                    "Unlocks access to subsidized interest rates (1–2% lower), collateral-free lending under CGTMSE, and priority processing under RBI guidelines for MSME lending.",
            },
        ];
        const nextFallback = fallbacks[topActions.length] || fallbacks[0];
        // Avoid duplicates
        if (!topActions.find((a) => a.action_title === nextFallback.action_title)) {
            topActions.push(nextFallback);
        } else {
            break;
        }
    }

    // Generate readiness summary
    const { readiness_score, classification } = readiness;
    let readiness_summary: string;
    if (readiness_score >= 80) {
        readiness_summary = `Strong position (${readiness_score}/100). Focus on documentation and timing to maximize approval terms.`;
    } else if (readiness_score >= 60) {
        readiness_summary = `Moderate position (${readiness_score}/100). Address the high-priority items below to strengthen the application before submission.`;
    } else if (readiness_score >= 40) {
        readiness_summary = `Weak position (${readiness_score}/100). Significant improvements needed — focus on the roadmap items before approaching any lender.`;
    } else {
        readiness_summary = `High Risk position (${readiness_score}/100). The financial profile currently has fundamental weaknesses that will likely result in rejection. Address all roadmap items as priority.`;
    }

    return {
        financial_roadmap: topActions.slice(0, 3),
        readiness_summary,
    };
}
