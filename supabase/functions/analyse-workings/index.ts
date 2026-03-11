// Supabase Edge Function: analyse-workings
// Calls Claude API to analyse a student's workings and provide personalised feedback
// on where they went wrong compared to the correct solution.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const { questionText, partLabel, studentWorkings, studentAnswer, correctAnswer, correctSolution, topic, subtopic } = await req.json();

    if (!studentWorkings && !studentAnswer) {
      return new Response(
        JSON.stringify({ error: "No workings or answer provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = `You are a friendly, encouraging Irish Leaving Certificate Honours Maths tutor. A student just attempted a question and got the wrong answer. Analyse their workings and give specific, helpful feedback.

QUESTION CONTEXT:
- Topic: ${topic || "Maths"} ${subtopic ? `(${subtopic})` : ""}
- Part: ${partLabel || "Full question"}
- Question: ${questionText || "See exam paper image"}

CORRECT ANSWER: ${correctAnswer}

CORRECT SOLUTION:
${correctSolution}

STUDENT'S WORKINGS:
${studentWorkings || "(No workings provided — they may have done them on paper)"}

STUDENT'S ANSWER: ${studentAnswer || "(Skipped)"}

INSTRUCTIONS:
1. If the student provided workings, identify the SPECIFIC step where they first went wrong. Quote their exact mistake.
2. Explain WHY that step is incorrect in simple, clear language.
3. Give a short hint about what they SHOULD have done at that step.
4. If they made no workings, suggest what approach they should start with.
5. Be encouraging — they're learning! Use phrases like "You were on the right track" or "Good attempt" where appropriate.
6. Keep it concise — 3-5 sentences max.
7. Use proper maths notation where needed (the app renders KaTeX, so use standard notation).

RESPOND IN JSON FORMAT:
{
  "mistake": "Brief description of the key mistake (1 sentence)",
  "explanation": "Why this is wrong and what they should have done (2-3 sentences)",
  "encouragement": "A short encouraging note (1 sentence)",
  "stepWrong": "The step number or description where they first went wrong (if identifiable)"
}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 500,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API error:", errorText);
      return new Response(
        JSON.stringify({ error: "AI analysis failed", details: errorText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const aiText = data.content?.[0]?.text || "";

    // Try to parse JSON from the response
    let feedback;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      feedback = jsonMatch ? JSON.parse(jsonMatch[0]) : { explanation: aiText };
    } catch {
      feedback = {
        mistake: "Analysis complete",
        explanation: aiText,
        encouragement: "Keep practising!",
      };
    }

    return new Response(
      JSON.stringify({ feedback }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error", message: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
