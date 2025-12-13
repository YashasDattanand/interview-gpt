import express from "express";
import { groq } from "../utils/groq.js";
import fs from "fs";

const router = express.Router();
const rag = JSON.parse(
  fs.readFileSync("./rag/glim_questions.json", "utf8")
);

router.post("/next", async (req, res) => {
  const { history, role } = req.body;

  try {
    const context = rag[role]?.join("\n") || "";

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `
You are a human interviewer.
Ask ONE question at a time.
If the candidate gives a weak or vague answer, ask WHY or ask for an example.
Do not be robotic.
`
        },
        {
          role: "user",
          content: `
Interview context (GLIM):
${context}

Conversation so far:
${history}

Ask the next best question.
`
        }
      ],
      temperature: 0.7
    });

    res.json({
      question: completion.choices[0].message.content
    });
  } catch (err) {
    console.error("INTERVIEW FLOW ERROR:", err.message);
    res.status(500).json({ error: "Question generation failed" });
  }
});

export default router;
