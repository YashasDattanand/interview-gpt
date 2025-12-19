import express from "express";
import { groq } from "../utils/groq.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { conversation } = req.body;

    if (!conversation || conversation.length === 0) {
      return res.status(400).json({ error: "No conversation provided" });
    }

    const prompt = `
You are an interview evaluator.
Give structured feedback with scores out of 10.

Format strictly as JSON:
{
  "overallScore": number,
  "strengths": [],
  "weaknesses": [],
  "improvements": []
}
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: JSON.stringify(conversation) }
      ]
    });

    const feedback = JSON.parse(completion.choices[0].message.content);

    res.json(feedback);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Feedback generation failed" });
  }
});

export default router;
