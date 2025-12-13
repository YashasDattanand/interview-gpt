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

    // Ask fixed GLIM questions first
    if (history.length < base.length) {
      return res.json({ question: base[history.length] });
    }

    // Adaptive follow-up
    const convo = history
      .map(h => `Q: ${h.question}\nA: ${h.answer}`)
      .join("\n");

    const prompt = `
You are an interviewer.
Ask ONE relevant follow-up question based on this interview:
${convo}
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5
    });

    res.json({ question: completion.choices[0].message.content.trim() });
  } catch {
    res.status(500).json({ error: "Interview flow failed" });
  }
});

export default router;
