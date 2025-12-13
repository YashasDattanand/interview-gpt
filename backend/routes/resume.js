import express from "express";
import { groq } from "../utils/groq.js";

const router = express.Router();

router.post("/analyze", async (req, res) => {
  const { resume, jd } = req.body;

  const prompt = `
You are an ATS + interview expert.

Compare Resume and JD.
Return:
- Match score (0-100)
- Matched keywords
- Missing keywords
- Section-wise feedback
- Improvement tips

Resume:
${resume}

JD:
${jd}
`;

  const completion = await groq.chat.completions.create({
    model: "mixtral-8x7b-32768",
    messages: [{ role: "user", content: prompt }]
  });

  res.json({ result: completion.choices[0].message.content });
});

export default router;
