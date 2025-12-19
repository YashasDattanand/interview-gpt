import express from "express";
import Groq from "groq-sdk";

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post("/", async (req, res) => {
  const { conversation, plan } = req.body;

  if (!conversation || conversation.length < 4) {
    return res.status(400).json({ error: "Interview too short" });
  }

  const prompt = `
You are an interview evaluator.

Interview plan:
${JSON.stringify(plan, null, 2)}

Conversation:
${conversation.map(c => `${c.role}: ${c.content}`).join("\n")}

Evaluate on:
- Communication
- Clarity
- Confidence
- Structure
- Coverage of interview plan

Return STRICT JSON:
{
  "overall": number,
  "scores": {
    "communication": number,
    "clarity": number,
    "confidence": number,
    "structure": number
  },
  "strengths": [],
  "weaknesses": [],
  "improvements": []
}
`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3
  });

  const feedback = JSON.parse(completion.choices[0].message.content);
  res.json(feedback);
});

export default router;
