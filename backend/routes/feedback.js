import express from "express";
import Groq from "groq-sdk";

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post("/", async (req, res) => {
  try {
    const { conversation } = req.body;
    if (!conversation || conversation.length === 0) {
      return res.status(400).json({ error: "No conversation provided" });
    }

    const prompt = `
You are an interview evaluator.

Analyze the interview transcript below and return STRICT JSON:

{
  "scores": {
    "communication": number (1-10),
    "clarity": number (1-10),
    "confidence": number (1-10),
    "depth": number (1-10)
  },
  "strengths": [string],
  "weaknesses": [string],
  "improvements": [string]
}

Transcript:
${conversation.map(m => `${m.role}: ${m.content}`).join("\n")}
`;

    const completion = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3
    });

    const feedback = JSON.parse(completion.choices[0].message.content);
    res.json(feedback);

  } catch (err) {
    console.error("Feedback error:", err);
    res.status(500).json({ error: "Feedback generation failed" });
  }
});

export default router;
