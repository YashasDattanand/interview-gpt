import express from "express";
import { groq } from "../utils/groq.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { transcript, role = "General", level = "Student" } = req.body;

    if (!transcript) {
      return res.status(400).json({ error: "Transcript missing" });
    }

    const prompt = `
You are a strict but encouraging interview coach.

Analyze the following interview answer for the role of ${role} (${level}).

Transcript:
"""${transcript}"""

Return ONLY valid JSON:

{
  "scores": {
    "clarity": 1-5,
    "structure": 1-5,
    "relevance": 1-5,
    "confidence": 1-5
  },
  "strengths": [string],
  "weaknesses": [string],
  "improvements": [string],
  "overall_feedback": string
}
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3
    });

    const output = completion.choices[0].message.content;

    res.json(JSON.parse(output));
  } catch (err) {
    console.error("Groq error:", err);
    res.status(500).json({
      error: "AI feedback generation failed",
      details: err.message
    });
  }
});

export default router;
