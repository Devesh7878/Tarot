import OpenAI from "openai";
import { buildKit } from "./kit-builder.js";

function extractJsonBlock(text) {
  const match = text.match(/```json\s*([\s\S]*?)\s*```/i) || text.match(/\{[\s\S]*\}/);
  return match ? match[1] || match[0] : text;
}

export async function generateInterviewKit({ jobDescription, companyUrl, days }) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return buildKit(jobDescription, companyUrl, days);
  }

  try {
    const client = new OpenAI({ apiKey });
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.3,
      input: [
        {
          role: "system",
          content:
            "You are a careful interview-prep assistant. Return valid JSON only. The output must contain companyBrief, roleBreakdown, requirements, questionBank, flashcards, schedule, days, and coverage fields.",
        },
        {
          role: "user",
          content: JSON.stringify({
            jobDescription,
            companyUrl,
            days,
            instructions:
              "Extract must-have requirements from the JD, build a realistic interview prep kit, and keep the JSON structure consistent for a frontend or platform role.",
          }),
        },
      ],
    });

    const rawText = response.output_text || "";
    const jsonCandidate = extractJsonBlock(rawText);
    const parsed = JSON.parse(jsonCandidate);

    if (parsed?.companyBrief && parsed?.questionBank && parsed?.schedule) {
      return parsed;
    }
  } catch (error) {
    console.warn("AI generation failed, falling back to deterministic kit builder.", error);
  }

  return buildKit(jobDescription, companyUrl, days);
}
