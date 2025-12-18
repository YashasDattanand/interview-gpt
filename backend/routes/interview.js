import express from "express";
import fs from "fs";
import Groq from "groq-sdk";

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post("/", async (req, res) => {
  try {
    const { role, experience, company, conversation = [] } = req.body;

    if (!role || !experience) {
      return res.status(400).json({ error: "Missing role or experience" });
    }

    // Load RAG (grounding, not embeddings)
    const ragPath = `./rag/${role}.json`;
    let ragContext = "";
    if (fs.existsSync(ragPath)) {
      const rag = JSON.parse(fs.readFileSync(ragPath, "utf-8"));
      ragContext = rag.interview_experiences.join("\n");
    }

    const systemPrompt = `
You are a senior interviewer and coach.

Your job:
- Conduct a realistic interview
- Ask ONE question at a time
- Use the candidate’s previous answer to ask follow-ups
- Do NOT repeat questions
- Difficulty based on experience: ${experience}
- If company is "${company}" and not General, ask 1–2 company-specific questions
- If answer is shallow, probe "why" or "how"
- Start broad, then go deeper

Grounding (past interview signals):
${ragContext}
`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversation
    ];

    const completion = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages,
      temperature: 0.7
    });

    const question = completion.choices[0].message.content.trim();
    res.json({ question });

  } catch (err) {
    console.error("Interview error:", err);
    res.status(500).json({ error: "Interview failed" });
  }
});

export default router;
