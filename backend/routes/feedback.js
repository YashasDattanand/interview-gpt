import express from "express";
import { groq } from "../utils/groq.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { transcript, role } = req.body;

    if (!transcript || transcript.length < 30) {
      return res.status(400).json({ error: "Transcript too short" });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            "You are an empathetic interview coach. Be constructive, not harsh."
        },
        {
          role: "user",
          content: `
Role: ${role}

Transcript:
${transcript}

Return STRICT JSON:
{
  "scores": {
    "clarity": number,
    "confidence": number,
    "structure": number,
    "relevance": number
  },
  "strengths": [string],
  "improvements": [string],
  "overall": string
}
`
        }
      ]
    });

    res.json(JSON.parse(completion.choices[0].message.content));

  } catch (err) {
    console.error("Feedback error:", err.message);
    res.status(500).json({ error: "Feedback generation failed" });
  }
});

export default router;
