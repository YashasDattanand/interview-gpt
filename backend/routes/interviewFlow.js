import express from "express";
import fs from "fs";
import path from "path";
import { groq } from "../utils/groq.js";

const router = express.Router();

const ragPath = path.join(process.cwd(), "rag", "glim_questions.json");
const ragData = JSON.parse(fs.readFileSync(ragPath, "utf-8"));

router.post("/next", async (req, res) => {
  try {
    const { role, history } = req.body;

    if (!role) {
      return res.status(400).json({ error: "Role missing" });
    }

    const baseQuestions = ragData[role] || [];

    const historyText = (history || [])
      .map(h => `Q: ${h.question}\nA: ${h.answer}`)
      .join("\n");

    const prompt = `
You are an interviewer for GLIM students.

Base questions:
${baseQuestions.join("\n")}

Conversation so far:
${historyText}

Rules:
- Ask ONE interview question
- Do NOT repeat previous questions
- Keep it role-relevant
- Be realistic and human

Return ONLY the question text.
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6
    });

    res.json({
      question: completion.choices[0].message.content.trim()
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate next question" });
  }
});

export default router;
