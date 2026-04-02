import OpenAI from "openai";
import { aiAnalysisSchema, type AiAnalysis } from "@/lib/validation/ai";

// Prefer DeepSeek, fall back to OpenAI
const USE_DEEPSEEK = !!process.env.DEEPSEEK_API_KEY;
const API_KEY = process.env.DEEPSEEK_API_KEY ?? process.env.OPENAI_API_KEY;
if (!API_KEY) {
  console.warn(
    "[AI] No API key configured. Set DEEPSEEK_API_KEY or OPENAI_API_KEY in your environment."
  );
}

const openai = new OpenAI({
  apiKey: API_KEY,
  ...(USE_DEEPSEEK && { baseURL: "https://api.deepseek.com" }),
});

const AI_MODEL = USE_DEEPSEEK ? "deepseek-chat" : "gpt-4o-mini";

const SYSTEM_PROMPT = `You are an expert software project estimator. Analyze the following project brief and return a JSON object with this exact structure:
{
  "features": ["string array of specific features/requirements extracted from the description"],
  "category": "one of: WEB_APP | MOBILE | AI_ML | AUTOMATION | INTEGRATION",
  "effortMin": <integer, minimum estimated hours>,
  "effortMax": <integer, maximum estimated hours>,
  "techStack": ["recommended technologies, frameworks, and tools"],
  "complexityScore": <integer 1-5, where 1=trivial and 5=extremely complex>
}

Rules:
- features: Extract concrete, actionable requirements. Be specific. Min 3, max 15 items.
- category: Choose the single best fit based on the primary nature of the project.
- effortMin/effortMax: Realistic engineering hours (not project days). effortMax must be > effortMin.
- techStack: List 3-8 specific technologies appropriate for the project.
- complexityScore: 1=simple CRUD, 2=moderate, 3=significant integrations, 4=complex architecture, 5=cutting-edge/research-level.
Return ONLY valid JSON, no markdown, no explanation.`;

async function callOpenAIWithRetry(prompt: string, maxRetries = 3): Promise<string | null> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await openai.chat.completions.create({
        model: AI_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Project Brief:\n${prompt}` },
        ],
        ...(USE_DEEPSEEK
          ? { response_format: { type: "json_object" as const } }
          : { response_format: { type: "json_object" as const } }),
        temperature: 0.2,
      });

      const text = response.choices[0]?.message?.content;
      if (!text || text.trim() === "") {
        throw new Error("Empty response from AI");
      }
      return text;
    } catch (error) {
      const isLastAttempt = attempt === maxRetries;
      if (isLastAttempt) {
        console.error(`[AI] All ${maxRetries} attempts failed:`, error);
        return null;
      }
      const delayMs = 500 * Math.pow(2, attempt - 1);
      console.warn(`[AI] Attempt ${attempt} failed, retrying in ${delayMs}ms...`, error);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  return null;
}

// Strip HTML tags to get plain text for the AI prompt
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export async function analyzeBrief(
  title: string,
  description: string
): Promise<{ analysis: AiAnalysis | null; rawResponse: string | null }> {
  const plainDescription = stripHtml(description);
  const prompt = `Title: ${title}\n\nDescription: ${plainDescription}`;

  const rawResponse = await callOpenAIWithRetry(prompt);

  if (!rawResponse) {
    return { analysis: null, rawResponse: null };
  }

  try {
    const parsed = JSON.parse(rawResponse);
    const result = aiAnalysisSchema.safeParse(parsed);

    if (!result.success) {
      console.error("[AI] Schema validation failed:", result.error.flatten());
      return { analysis: null, rawResponse };
    }

    return { analysis: result.data, rawResponse };
  } catch (error) {
    console.error("[AI] JSON parse failed:", error, "Raw:", rawResponse);
    return { analysis: null, rawResponse };
  }
}
