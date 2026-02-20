import { FinancialMetrics, FundingReadiness } from "./financial-calculations";

// ─── Interfaces ──────────────────────────────────────────────

export interface FundingOption {
    name: string;
    type: string;
    official_link: string;
    amount_range: string;
    why_suitable: string;
    basic_eligibility: string;
}

export interface PrimaryRecommendation {
    funding_type: string;
    suggested_amount_range: string;
    best_timing: string;
    reason: string;
}

export interface SmartFundingRecommendation {
    primary_recommendation: PrimaryRecommendation;
    funding_options: FundingOption[];
}

// ─── Real Indian MSME Scheme Database ────────────────────────

interface SchemeEntry {
    name: string;
    type: string;
    official_link: string;
    description: string;
    max_amount: string;
    eligibility: string;
    best_for: string[];           // goal tags
    risk_suitability: string[];   // "Low" | "Moderate" | "High"
    revenue_tier: string[];       // "micro" (<₹5L/mo) | "small" (₹5L–25L) | "medium" (₹25L+)
}

const SCHEME_DATABASE: SchemeEntry[] = [
    {
        name: "PM MUDRA Yojana — Shishu",
        type: "Government Micro-Loan",
        official_link: "https://www.mudra.org.in/",
        description: "Collateral-free loans up to ₹50,000 for micro enterprises under the Pradhan Mantri MUDRA Yojana.",
        max_amount: "Up to ₹50,000",
        eligibility: "Any non-corporate, non-farm small/micro enterprise; Aadhaar, PAN, and business proof required",
        best_for: ["Working Capital", "Inventory Financing"],
        risk_suitability: ["High", "Moderate"],
        revenue_tier: ["micro"],
    },
    {
        name: "PM MUDRA Yojana — Kishore",
        type: "Government MSME Loan",
        official_link: "https://www.mudra.org.in/",
        description: "Loans from ₹50,001 to ₹5,00,000 for growing micro/small enterprises under MUDRA scheme.",
        max_amount: "₹50,001 – ₹5,00,000",
        eligibility: "Existing business with 1+ year track record; basic KYC and business plan required",
        best_for: ["Working Capital", "Inventory Financing", "Marketing & Growth"],
        risk_suitability: ["High", "Moderate"],
        revenue_tier: ["micro", "small"],
    },
    {
        name: "PM MUDRA Yojana — Tarun",
        type: "Government MSME Loan",
        official_link: "https://www.mudra.org.in/",
        description: "Loans from ₹5,00,001 to ₹10,00,000 for established micro/small businesses looking to expand.",
        max_amount: "₹5,00,001 – ₹10,00,000",
        eligibility: "Established business with 2+ year track record; financials and business plan required",
        best_for: ["Business Expansion", "Equipment Purchase", "Working Capital"],
        risk_suitability: ["Moderate", "Low"],
        revenue_tier: ["small", "medium"],
    },
    {
        name: "CGTMSE-backed MSME Loan",
        type: "Govt-Guaranteed Collateral-Free Loan",
        official_link: "https://www.cgtmse.in/",
        description: "Collateral-free credit facility up to ₹5 Crore backed by Credit Guarantee Fund Trust for Micro and Small Enterprises.",
        max_amount: "Up to ₹5 Crore",
        eligibility: "New and existing MSEs in manufacturing/service sector; loan through eligible lending institutions",
        best_for: ["Business Expansion", "Equipment Purchase", "Working Capital", "Debt Consolidation"],
        risk_suitability: ["Low", "Moderate"],
        revenue_tier: ["small", "medium"],
    },
    {
        name: "SBI MSME Loans",
        type: "Bank Term Loan / Working Capital",
        official_link: "https://sbi.co.in/web/business/sme",
        description: "Comprehensive MSME loan products from State Bank of India including term loans, working capital, and overdraft facilities.",
        max_amount: "Based on business turnover and need",
        eligibility: "MSME Udyam registration; 2+ years of ITR; satisfactory CIBIL score (700+)",
        best_for: ["Business Expansion", "Equipment Purchase", "Working Capital", "Debt Consolidation"],
        risk_suitability: ["Low", "Moderate"],
        revenue_tier: ["small", "medium"],
    },
    {
        name: "SIDBI MSME Finance",
        type: "Development Finance Institution Loan",
        official_link: "https://www.sidbi.in/",
        description: "Direct and indirect credit from Small Industries Development Bank of India for MSMEs at competitive rates.",
        max_amount: "₹10 Lakh – ₹25 Crore",
        eligibility: "Registered MSME with Udyam; minimum 3 years operational history; positive net worth",
        best_for: ["Equipment Purchase", "Business Expansion", "Marketing & Growth"],
        risk_suitability: ["Low"],
        revenue_tier: ["medium"],
    },
    {
        name: "Stand-Up India Scheme",
        type: "Government Loan for SC/ST/Women",
        official_link: "https://www.standupmitra.in/",
        description: "Loans between ₹10 Lakh and ₹1 Crore for SC/ST and women entrepreneurs for greenfield enterprises in manufacturing, services, or trading.",
        max_amount: "₹10 Lakh – ₹1 Crore",
        eligibility: "SC/ST or women entrepreneur; 18+ years; greenfield enterprise; available through all SCBs",
        best_for: ["Business Expansion", "Equipment Purchase"],
        risk_suitability: ["Low", "Moderate"],
        revenue_tier: ["small", "medium"],
    },
    {
        name: "PSB Loans in 59 Minutes",
        type: "Fast-Track Bank Loan",
        official_link: "https://www.psbloansin59minutes.com/",
        description: "In-principle approval for MSME loans up to ₹5 Crore in 59 minutes through an online platform connected to all major PSBs.",
        max_amount: "Up to ₹5 Crore",
        eligibility: "Business vintage 3+ years; GST registered; ITR for last 2 years; minimum turnover ₹10 Lakh",
        best_for: ["Working Capital", "Business Expansion", "Equipment Purchase"],
        risk_suitability: ["Low", "Moderate"],
        revenue_tier: ["small", "medium"],
    },
    {
        name: "NBFC Working Capital Loan",
        type: "NBFC Short-Term Finance",
        official_link: "",
        description: "Short-term working capital loans from Non-Banking Financial Companies. Faster approval but typically higher interest rates than banks.",
        max_amount: "Varies by NBFC (typically ₹1 Lakh – ₹50 Lakh)",
        eligibility: "Business operational for 1+ year; basic documentation; flexible credit score requirements",
        best_for: ["Working Capital", "Inventory Financing"],
        risk_suitability: ["High", "Moderate"],
        revenue_tier: ["micro", "small"],
    },
];

// ─── Helper Functions ────────────────────────────────────────

function getRevenueTier(revenue: number): string {
    if (revenue < 500000) return "micro";       // < ₹5L/mo
    if (revenue < 2500000) return "small";      // ₹5L–25L/mo
    return "medium";                             // ₹25L+/mo
}

function formatAmount(amount: number): string {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
    return `₹${amount.toLocaleString("en-IN")}`;
}

function getSuggestedAmountRange(
    revenue: number,
    riskLevel: string,
    classification: string
): string {
    let multiplierLow: number;
    let multiplierHigh: number;

    if (classification === "High Risk" || riskLevel === "High") {
        multiplierLow = 0.5;
        multiplierHigh = 1;
    } else if (classification === "Weak") {
        multiplierLow = 1;
        multiplierHigh = 2;
    } else if (classification === "Moderate") {
        multiplierLow = 2;
        multiplierHigh = 3;
    } else {
        // Strong
        multiplierLow = 3;
        multiplierHigh = 4;
    }

    const low = Math.round(revenue * multiplierLow);
    const high = Math.round(revenue * multiplierHigh);

    return `${formatAmount(low)} – ${formatAmount(high)}`;
}

function getTiming(runwayMonths: number | "stable"): string {
    if (runwayMonths === "stable") {
        return "No urgency — plan strategically for expansion funding in the next 3–6 months";
    }
    if (typeof runwayMonths === "number") {
        if (runwayMonths < 3) {
            return "Urgent — apply immediately but with conservative expectations; prioritize survival over growth";
        }
        if (runwayMonths < 6) {
            return "Apply within the next 4–6 weeks; secure working capital before runway becomes critical";
        }
        if (runwayMonths <= 12) {
            return "Apply within 1–3 months; you have time to prepare a strong application";
        }
        return "Strategic timing — apply in the next 3–6 months for expansion or growth capital";
    }
    return "Assess runway first, then apply when financials are clear";
}

function getPrimaryFundingType(
    riskLevel: string,
    classification: string,
    goal: string,
    revenueTier: string
): string {
    if (classification === "High Risk") {
        return revenueTier === "micro"
            ? "Micro-Finance / MUDRA Shishu-Kishore"
            : "NBFC Working Capital Loan";
    }
    if (classification === "Weak") {
        if (goal === "Working Capital" || goal === "Inventory Financing") {
            return "MUDRA Tarun / NBFC Working Capital";
        }
        return "CGTMSE-backed Collateral-Free Loan";
    }
    if (classification === "Moderate") {
        if (goal === "Equipment Purchase") return "SIDBI Term Loan / SBI MSME Loan";
        if (goal === "Business Expansion") return "CGTMSE-backed Loan / PSB Loans in 59 Min";
        return "SBI MSME Loan / CGTMSE-backed Loan";
    }
    // Strong
    if (goal === "Equipment Purchase") return "SIDBI Finance / SBI MSME Term Loan";
    if (goal === "Business Expansion") return "PSB Loans in 59 Min / SIDBI Finance";
    return "SBI MSME Loan / PSB Loans in 59 Minutes";
}

function getPrimaryReason(
    classification: string,
    riskLevel: string,
    goal: string,
    revenue: number
): string {
    const revFmt = formatAmount(revenue);

    if (classification === "High Risk") {
        return `Given the high-risk financial profile, the priority is to secure small, accessible working capital. MUDRA and NBFC loans have lenient eligibility and can provide immediate relief. Avoid over-leveraging at this stage.`;
    }
    if (classification === "Weak") {
        return `With a weak financial profile and monthly revenue of ${revFmt}, collateral-free schemes like CGTMSE are ideal as they reduce lender risk. Focus on building a stronger credit history before pursuing larger funding.`;
    }
    if (classification === "Moderate") {
        return `Your moderate financial health and ${revFmt} monthly revenue make you eligible for mainstream MSME lending. Government-backed schemes offer competitive rates. Apply with strong documentation to maximize approval chances.`;
    }
    return `Strong financial health with ${revFmt} monthly revenue positions you well for premium lending products. You can negotiate favorable terms. Consider strategic timing to align funding with your ${goal.toLowerCase()} plans.`;
}

// ─── Main Recommendation Engine ──────────────────────────────

export function calculateFundingRecommendation(
    metrics: FinancialMetrics,
    readiness: FundingReadiness,
    revenue: number,
    goal: string
): SmartFundingRecommendation {
    const revenueTier = getRevenueTier(revenue);
    const { classification } = readiness;
    const { riskLevel, runwayMonths } = metrics;

    // 1. Build primary recommendation
    const primary_recommendation: PrimaryRecommendation = {
        funding_type: getPrimaryFundingType(riskLevel, classification, goal, revenueTier),
        suggested_amount_range: getSuggestedAmountRange(revenue, riskLevel, classification),
        best_timing: getTiming(runwayMonths),
        reason: getPrimaryReason(classification, riskLevel, goal, revenue),
    };

    // 2. Select 2–3 best matching schemes
    const scored = SCHEME_DATABASE.map((scheme) => {
        let score = 0;

        // Risk suitability match
        if (scheme.risk_suitability.includes(riskLevel)) score += 3;

        // Revenue tier match
        if (scheme.revenue_tier.includes(revenueTier)) score += 3;

        // Goal match
        if (scheme.best_for.includes(goal)) score += 4;

        // Partial goal match (any overlap)
        if (score < 4 && scheme.best_for.some(g => goal.includes(g.split(" ")[0]))) score += 1;

        return { scheme, score };
    });

    // Sort by score descending, take top 2–3
    scored.sort((a, b) => b.score - a.score);

    const topSchemes = scored.slice(0, 3).filter(s => s.score >= 3);
    // Ensure at least 2
    const finalSchemes = topSchemes.length >= 2 ? topSchemes : scored.slice(0, 2);

    const funding_options: FundingOption[] = finalSchemes.map(({ scheme }) => {
        // Generate contextual why_suitable
        let why_suitable: string;
        if (scheme.risk_suitability.includes(riskLevel) && scheme.best_for.includes(goal)) {
            why_suitable = `Directly matches your ${goal.toLowerCase()} goal and ${riskLevel.toLowerCase()}-risk profile. ${scheme.description}`;
        } else if (scheme.best_for.includes(goal)) {
            why_suitable = `Well-suited for your ${goal.toLowerCase()} needs. ${scheme.description}`;
        } else if (scheme.risk_suitability.includes(riskLevel)) {
            why_suitable = `Compatible with your ${riskLevel.toLowerCase()}-risk financial profile. ${scheme.description}`;
        } else {
            why_suitable = scheme.description;
        }

        return {
            name: scheme.name,
            type: scheme.type,
            official_link: scheme.official_link,
            amount_range: scheme.max_amount,
            why_suitable,
            basic_eligibility: scheme.eligibility,
        };
    });

    return { primary_recommendation, funding_options };
}
