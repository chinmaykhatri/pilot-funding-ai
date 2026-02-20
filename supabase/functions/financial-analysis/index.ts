import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { financialData, metrics, readinessScore } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { revenue, expenses, cash, debt, goal } = financialData;
    const { burnRate, runwayMonths, debtRatio, riskLevel } = metrics;

    const prompt = `You are an expert MSME financial analyst and funding advisor. Analyze the following business financials and provide a comprehensive report.

FINANCIAL DATA:
- Monthly Revenue: ₹${revenue}
- Monthly Expenses: ₹${expenses}
- Cash Balance: ₹${cash}
- Existing Debt: ₹${debt}
- Funding Goal: ${goal}

PRE-CALCULATED METRICS:
- Burn Rate: ₹${burnRate}/month
- Runway: ${runwayMonths} months
- Debt Ratio: ${debtRatio}
- Risk Level: ${riskLevel}
- Funding Readiness Score: ${readinessScore}/100

Provide your response as a valid JSON object with these exact keys:
{
  "aiSummary": "A 2-3 sentence executive summary of the business financial health",
  "readinessReason": "A short explanation of why the readiness score is ${readinessScore}/100",
  "recommendation": {
    "fundingType": "Recommended funding type (e.g., Term Loan, Working Capital Loan, Govt Scheme like MUDRA/CGTMSE, Venture Debt, etc.)",
    "amountRange": "Suggested amount range (e.g., ₹5L - ₹10L)",
    "timing": "Best timing to apply",
    "reason": "Short reasoning for this recommendation",
    "schemes": [
      {"name": "Scheme name (e.g., MUDRA Yojana, CGTMSE, Stand-Up India, PSB Loans in 59 Minutes, etc.)", "description": "1-2 sentence description of the scheme and its benefits", "eligibility": "Key eligibility criteria for this MSME"},
      {"name": "Another relevant scheme", "description": "Description", "eligibility": "Eligibility"}
    ]
  },
  "loanApplication": {
    "businessSummary": "Professional business summary for bank submission (3-4 sentences)",
    "fundingRequirement": "Detailed funding requirement statement",
    "financialJustification": "Financial justification with key metrics",
    "repaymentCapability": "Repayment capability assessment"
  },
  "rejectionRisks": {
    "risks": ["Risk 1", "Risk 2", "Risk 3"]
  },
  "improvements": {
    "steps": ["Step 1", "Step 2", "Step 3"]
  }
}

IMPORTANT: Return ONLY the JSON object, no markdown, no code blocks, no extra text.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are the backend financial engine for FinPilot.ai, a Pre-Loan Financial Intelligence Platform for MSMEs. Always calculate numbers explicitly using provided inputs. Never invent missing data. If calculation impossible, return 'Insufficient Data'. Always respond in valid JSON only. No conversational text outside JSON. Keep outputs concise and structured for dashboard display." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI analysis failed");
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) throw new Error("No AI response content");

    // Parse JSON from response, handling potential markdown code blocks
    let cleaned = content.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const parsed = JSON.parse(cleaned);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Financial analysis error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
