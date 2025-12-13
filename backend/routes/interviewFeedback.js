import express from "express";
import { groq } from "../utils/groq.js";

const router = express.Router();

router.post("/analyze", async (req, res) => {
  const { transcript, jd } = req.body;

  const prompt = `
Analyze this interview transcript.

Transcript:
${transcript}

JD:
${jd}

Return:
- Strengths
- Weaknesses
- Missed opportunities
- Actionable improvements
- Scores (1-5):
  Clarity, Structure, Relevance, Confidence, JD Match
Tone: Constructive and motivating.
`;

  const response = await groq.chat.completions.create({
    model: "mixtral-8x7b-32768",
    messages: [{ role: "user", content: prompt }]
  });

  res.json({ feedback: response.choices[0].message.content });
});

export default router;
