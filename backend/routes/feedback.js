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

    // ✅ Count meaningful user answers
    const userAnswers = conversation.filter(
      m => m.role === "user" && m.content && m.content.trim().length > 5
    );

    // ✅ If interview was abandoned
    if (userAnswers.length === 0) {
      return res.json({
        scores: {
          communication: 0,
          clarity: 0,
          confidence: 0
        },
        strengths: [],
        weaknesses: ["Interview ended without responses"],
        improvements: ["Complete the interview to receive feedback"]
      });
    }

    const messages = [
      {
        role: "system",
        content: `
You are an interview evaluator.

Rules:
- Score strictly based on actual user responses
- Penalize short or incomplete interviews
- Do not hallucinate strengths

Return STRICT JSON only:

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
      {
        role: "user",
        content: JSON.stringify(conversation)
      }
    ];

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages,
      temperature: 0.2
    });

    res.json(JSON.parse(completion.choices[0].message.content));

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Feedback generation failed" });
  }
});

export default router;
