import express from "express";
import Groq from "groq-sdk";

const router = express.Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

router.post("/", async (req, res) => {
  try {
    const { conversation } = req.body;

    if (!Array.isArray(conversation) || conversation.length === 0) {
      return res.status(400).json({ error: "No conversation provided" });
    }

    const messages = [
      {
        role: "system",
        content: `
You are an interview evaluator.
Analyze the interview and return JSON ONLY in this format:

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
`
      }
    ];

    conversation.forEach(msg => {
      if (typeof msg.content === "string") {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      }
    });

    const completion = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages
    });

    const raw = completion.choices[0].message.content;

    const jsonStart = raw.indexOf("{");
    const jsonEnd = raw.lastIndexOf("}");

    const parsed = JSON.parse(raw.slice(jsonStart, jsonEnd + 1));

    res.json(parsed);

  } catch (err) {
    console.error("Feedback error:", err.message);
    res.status(500).json({ error: "Feedback generation failed" });
  }
});

export default router;
