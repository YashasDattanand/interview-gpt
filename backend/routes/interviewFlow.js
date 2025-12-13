import express from "express";
import fs from "fs";
import path from "path";
import { groq } from "../utils/groq.js";

const router = express.Router();

const ragPath = path.join(process.cwd(), "rag", "glim_questions.json");
const rag = JSON.parse(fs.readFileSync(ragPath, "utf-8"));

router.post("/next", async (req, res) => {
  try {
    const { role, history } = req.body;
    const base = rag[role] || [];

    // First question
    if (history.length === 0) {
      return res.json({ question: base[0] });
    }

    const lastAnswer = history[history.length - 1].answer;

    const remainingBase = base.slice(history.length);

    const prompt = `
You are a human interviewer.

Candidate's last answer:
"${lastAnswer}"

Remaining base questions:
${remainingBase.join("\n")}

Rules:
- If the answer mentions a specific detail (place, company, tool, metric, failure, project),
  ask a FOLLOW-UP about it.
- Else, if base questions remain, ask the NEXT base question.
- Else, ask a deeper behavioral question.
Ask ONLY ONE question.
Sound natural and non-robotic.
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6
    });

    res.json({
      question: completion.choices[0].message.content.trim()
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Interview flow failed" });
  }
});

export default router;
