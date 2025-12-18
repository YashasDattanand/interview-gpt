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

    const completion = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [
        {
          role: "system",
          content: `
You are an interview evaluator.
Return STRICT JSON in this format:

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
          `,
        },
        ...conversation,
      ],
    });

    const json = completion.choices[0].message.content;
    res.json(JSON.parse(json));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Feedback generation failed" });
  }
});

export default router;
