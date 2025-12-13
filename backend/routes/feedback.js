import express from "express";
import { groq } from "../utils/groq.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { transcript, role } = req.body;

  const prompt = `
Give structured JSON feedback ONLY.
No markdown. No text outside JSON.

Keys:
overall_score (0-10)
strengths
weaknesses
improvements
sample_better_answer

Transcript:
${transcript}
`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }]
  });

  try {
    const parsed = JSON.parse(completion.choices[0].message.content);
    res.json(parsed);
  } catch {
    res.status(500).json({ error: "Feedback generation failed" });
  }
});

export default router;
