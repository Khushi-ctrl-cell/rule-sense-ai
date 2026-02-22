import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, mode } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompts: Record<string, string> = {
      chat: `You are the PS3 Compliance AI Assistant — an expert in Anti-Money Laundering (AML), regulatory compliance, financial crime detection, and the PS3 Data Policy Compliance Agent platform.

You have deep knowledge of:
- FATF Recommendations (especially 10, 16, 20, 22)
- RBI AML Guidelines 2023
- Basel III risk frameworks
- Transaction monitoring patterns (structuring, layering, circular transfers)
- Risk scoring methodologies
- Compliance rule engines (deterministic + AI hybrid)
- The IBM AML dataset structure and fields

When answering:
- Be precise, actionable, and cite regulatory references when relevant
- Explain concepts in plain language but with technical depth
- If asked about the platform, explain its architecture: deterministic rule engine + AI parsing layer
- Support ALL languages — detect the user's language and respond in the same language
- For rule suggestions, provide structured JSON examples
- For compliance questions, reference specific FATF recommendations or regulatory sections

You can help with: writing compliance rules, understanding violations, risk assessment, regulatory mapping, audit trail analysis, and general AML/KYC/CFT knowledge.`,

      "parse-rule": `You are a compliance rule parser. Convert natural language rule descriptions into structured JSON format.

Output ONLY valid JSON with this structure:
{
  "rule_id": "AML_XXX",
  "rule_name": "Short descriptive name",
  "description": "Full description",
  "required_fields": ["field1", "field2"],
  "condition_logic": "machine-readable condition",
  "severity": "Low|Medium|High|Critical",
  "monitoring_frequency": "real-time|daily|monthly",
  "category": "Transaction Monitoring|Pattern Detection|Behavioral Analysis|Geographic Risk|Network Analysis",
  "regulatory_ref": "Relevant regulation reference",
  "threshold_value": number_if_applicable,
  "confidence": number_0_to_100
}

Be precise with condition_logic — use SQL-like syntax. Always include regulatory_ref if applicable.`
    };

    const systemPrompt = systemPrompts[mode || "chat"] || systemPrompts.chat;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: mode !== "parse-rule",
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (mode === "parse-rule") {
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
