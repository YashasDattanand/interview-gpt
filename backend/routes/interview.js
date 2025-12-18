import express from "express";
import fs from "fs";
import Groq from "groq-sdk";

const router = express.Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

/**
 * POST /interview
 * body:
 * {
 *   role,
 *   experience,
 *   company,
 *   conversation: [{ role: "user"|"assistant", content: string }]
 * }
 */
router.post("/", async (req, res) => {
  try {
    const { role, experience, company, conversation = [] } = req.body;

    if (!role || !experience) {
      return res.status(400).json({ error: "Missing role or experience" });
    }

    // Load RAG safely
    let ragContext = "";
    const ragPath = `./rag/${role}.json`;

    if (fs.existsSync(ragPath)) {
      const ragData = JSON.parse(fs.readFileSync(ragPath, "utf-8"));
      ragContext = ragData.questions.join("\n");
    }

    const systemPrompt = `
You are an experienced interview COACH.

RULES:
- Conduct a realistic interview
- Start broad, then go deep
- Ask follow-up questions based on user's last answer
- Do NOT repeat questions
- Tailor difficulty based on experience: ${experience}
- If company provided (${company}), include 1–2 company-specific questions
- Ask ONLY ONE question at a time
`;

    const messages = [
      { role: "system", content: systemPrompt },
      {
        role: "system",
        content: `Role-specific interview topics:\n${ragContext}`
      },
      ...conversation
    ];

    const completion = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages,
      temperature: 0.7
    });

    const question = completion.choices[0].message.content;

    res.json({ question });

  } catch (err) {
    console.error("Interview error:", err);
    res.status(500).json({ error: "Interview failed" });
  }
});

export default router;
