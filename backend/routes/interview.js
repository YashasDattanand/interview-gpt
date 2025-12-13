import express from "express";
import fs from "fs";
import { groq } from "../utils/groq.js";

const router = express.Router();
const rag = JSON.parse(fs.readFileSync("./rag/glim_questions.json"));

router.post("/start", async (req, res) => {
  const { role, company } = req.body;

  const context = rag
    .filter(q => q.role === role && q.company === company)
    .map(q => q.question)
    .slice(0, 3)
    .join("\n");

  const prompt = `
You are an AI interviewer for GLIM.

Use ONLY these real questions:
${context}

Generate ONE interview question.
Ask follow-ups if vague.
`;

  const completion = await groq.chat.completions.create({
    model: "mixtral-8x7b-32768",
    messages: [{ role: "user", content: prompt }]
  });

  res.json({ question: completion.choices[0].message.content });
});

export default router;
