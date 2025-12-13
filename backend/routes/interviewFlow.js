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

    if (!role) {
      return res.status(400).json({ error: "Role missing" });
    }

    const baseQuestions = rag[role] || [];

    // SAFETY: stop if too many questions
    if (history && history.length >= baseQuestions.length) {
      return res.json({ done: true });
    }

    const asked = history?.map(h => h.question) || [];

    const remaining = baseQuestions.filter(
      q => !asked.includes(q)
    );

    // Ask directly from RAG first
    if (remaining.length > 0) {
      return res.json({ question: remaining[0] });
    }

    // Adaptive follow-up via Groq
    const context = history
      .map(h => `Q: ${h.question}\nA: ${h.answer}`)
      .join("\n");

    const prompt = `
You are interviewing a GLIM student for ${role}.
Ask ONE relevant follow-up question based on this conversation:

${context}
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5
    });

    res.json({
      question: completion.choices[0].message.content.trim()
    });
  } catch (err) {
    console.error("Interview flow error:", err);
    res.status(500).json({ error: "Interview flow failed" });
  }
});

export default router;
