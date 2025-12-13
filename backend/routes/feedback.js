import express from "express";
import { groq } from "../utils/groq.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { transcript, resume, jd } = req.body;

  const prompt = `
You are an interview evaluator.

Inputs:
Resume:
${resume}

Job Description:
${jd}

Interview Transcript:
${transcript}

Tasks:
1. Score (1-5) for:
   - Clarity
   - Relevance
   - Structure
   - Depth
   - Confidence
   - JD Match
2. Explain EACH score clearly
3. Identify:
   - Strengths
   - Weaknesses
   - Missed opportunities
4. Give actionable improvements
Tone: Constructive, humane, encouraging.

Return JSON.
`;

  const response = await groq.chat.completions.create({
    model: "mixtral-8x7b-32768",
    messages: [{ role: "user", content: prompt }]
  });

  res.json({ feedback: response.choices[0].message.content });
});

export default router;
