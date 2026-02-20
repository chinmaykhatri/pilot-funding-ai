import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { businessName, industry, revenue, expenses, cash, debt, fundingAmount, fundingPurpose } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prompt = `You are an expert MSME loan application writer. Generate a professional, bank-ready loan application draft based on the following business details.

BUSINESS DETAILS:
- Business Name: ${businessName || "Not specified"}
- Industry: ${industry || "Not specified"}
- Monthly Revenue: ₹${revenue}
- Monthly Expenses: ₹${expenses}
- Cash Balance: ₹${cash}
- Existing Debt: ₹${debt}
- Funding Amount Requested: ₹${fundingAmount}
- Purpose of Funding: ${fundingPurpose}

Provide your response as a valid JSON object with these exact keys:
{
  "businessSummary": "Professional business summary for bank submission (3-4 sentences, include business name and industry)",
  "fundingRequirement": "Detailed funding requirement statement with amount and purpose",
  "financialJustification": "Financial justification with key metrics showing the business can handle the loan",
  "repaymentCapability": "Repayment capability assessment based on revenue and expenses",
  "rejectionRisks": ["Risk 1 - specific reason this application might be rejected", "Risk 2", "Risk 3"]
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
          { role: "system", content: "You are a professional loan application writer for FinPilot.ai. Always calculate numbers explicitly using provided inputs. Never invent missing data. Always respond in valid JSON only. No conversational text outside JSON." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI generation failed");
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;
    if (!content) throw new Error("No AI response content");

    let cleaned = content.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const parsed = JSON.parse(cleaned);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Loan application generation error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
