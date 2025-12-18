import express from "express";
import Groq from "groq-sdk";

const router = express.Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

router.post("/", async (req, res) => {
  try {
    const { conversation } = req.body;

    if (!conversation || conversation.length === 0) {
      return res.status(400).json({ error: "No conversation provided" });
    }

    const prompt = `
You are an interview evaluator.

Evaluate the candidate and respond ONLY in valid JSON.

Format:
{
  "scores": {
    "communication": number (1-10),
    "clarity": number (1-10),
    "confidence": number (1-10)
  },
  "strengths": [string],
  "weaknesses": [string],
  "improvements": [string]
}
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: prompt },
        ...conversation,
      ],
      temperature: 0.3,
    });

    const raw = completion.choices?.[0]?.message?.content;

    res.json(JSON.parse(raw));
  } catch (err) {
    console.error("Feedback error:", err);
    res.status(500).json({ error: "Feedback generation failed" });
  }
});

export default router;
