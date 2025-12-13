import express from "express";
import { groq } from "../utils/groq.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { transcript, role } = req.body;

    const prompt = `
You are an interview coach.

Evaluate this interview transcript for a ${role} candidate:

${transcript}

Return STRICT JSON:
{
  "scores": {
    "clarity": 1-5,
    "structure": 1-5,
    "confidence": 1-5,
    "relevance": 1-5
  },
  "strengths": [string],
  "weaknesses": [string],
  "improvements": [string],
  "summary": string
}
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3
    });

    res.json(JSON.parse(completion.choices[0].message.content));
  } catch {
    res.status(500).json({ error: "Feedback generation failed" });
  }
});

export default router;
