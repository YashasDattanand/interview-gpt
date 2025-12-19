import express from "express";
import Groq from "groq-sdk";

const router = express.Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

router.post("/", async (req, res) => {
  try {
    const { conversation } = req.body;

    if (!conversation || conversation.length === 0) {
      return res.status(400).json({ error: "No conversation provided" });
    }

    const messages = [
      {
        role: "system",
        content: `
You are an interview evaluator.
Return JSON strictly in this format:

{
 "scores": {
   "communication": number,
   "clarity": number,
   "confidence": number
 },
 "strengths": [string],
 "weaknesses": [string],
 "improvements": [string]
}
`
      },
      { role: "user", content: JSON.stringify(conversation) }
    ];

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages,
      temperature: 0.3
    });

    res.json(JSON.parse(completion.choices[0].message.content));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Feedback generation failed" });
  }
});

export default router;
