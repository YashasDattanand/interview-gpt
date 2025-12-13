import express from "express";
import { groq } from "../utils/groq.js";

const router = express.Router();

function extractJSON(text) {
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first === -1 || last === -1) {
    throw new Error("No JSON found in LLM response");
  }
  return JSON.parse(text.slice(first, last + 1));
}

router.post("/", async (req, res) => {
  try {
    const { transcript, role, experience, company } = req.body;

    if (!transcript || transcript.length < 50) {
      return res.status(400).json({ error: "Transcript too short" });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: `
You are an expert interview evaluator.
You MUST return valid JSON.
Do NOT include explanations, markdown, or text outside JSON.
`
        },
        {
          role: "user",
          content: `
Candidate role: ${role}
Experience: ${experience}
Target company: ${company || "Not specified"}

Transcript:
${transcript}

Return JSON ONLY in this format:
{
  "scores": {
    "clarity": 1-5,
    "confidence": 1-5,
    "structure": 1-5,
    "relevance": 1-5
  },
  "strengths": [string],
  "improvements": [string],
  "overall_feedback": string
}
`
        }
      ]
    });

    const raw = completion.choices[0].message.content;
    const parsed = extractJSON(raw);

    res.json(parsed);
  } catch (err) {
    console.error("Feedback error:", err.message);
    res.status(500).json({ error: "Feedback generation failed" });
  }
});

export default router;
