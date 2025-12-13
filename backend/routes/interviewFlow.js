import express from "express";
import fs from "fs";
import { groq } from "../utils/groq.js";

const router = express.Router();

const ragData = JSON.parse(
  fs.readFileSync("./rag/glim_questions.json", "utf-8")
);

router.post("/next", async (req, res) => {
  try {
    const { role, history } = req.body;

    if (!role || !history) {
      return res.status(400).json({ error: "Missing role or history" });
    }

    const roleContext = ragData[role]?.join("\n") || "";

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: `
You are a human interviewer from GLIM.
You must:
- Ask ONE question at a time
- Use previous answers to ask follow-ups
- If answer is vague, ask WHY or ask for an example
- Do NOT be robotic
- Keep it conversational
`
        },
        {
          role: "user",
          content: `
GLIM interview reference questions:
${roleContext}

Conversation so far:
${history}

Decide the next best interview question.
`
        }
      ]
    });

    res.json({
      question: completion.choices[0].message.content.trim()
    });

  } catch (err) {
    console.error("Interview flow error:", err.message);
    res.status(500).json({ error: "Interview generation failed" });
  }
});

export default router;
