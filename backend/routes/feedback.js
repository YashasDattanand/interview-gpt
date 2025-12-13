import express from "express";
import { groq } from "../utils/groq.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { transcript, role } = req.body;

    if (!transcript || transcript.trim().length < 20) {
      return res.status(400).json({
        error: "Transcript too short for feedback"
      });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are an empathetic interview coach. Give structured feedback with scores."
        },
        {
          role: "user",
          content: `
Role: ${role}

Interview Transcript:
${transcript}

Return JSON in this format ONLY:
{
  "scores": {
    "clarity": number,
    "structure": number,
    "confidence": number,
    "relevance": number
  },
  "strengths": [string],
  "improvements": [string],
  "overall_feedback": string
}
`
        }
      ],
      temperature: 0.4
    });

    const raw = completion.choices[0].message.content;
    const parsed = JSON.parse(raw);

    res.json(parsed);
  } catch (err) {
    console.error("FEEDBACK ERROR:", err.message);
    res.status(500).json({ error: "Feedback generation failed" });
  }
});

export default router;
