import express from "express";
import fs from "fs";
import Groq from "groq-sdk";

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// In-memory session store (OK for demo)
const sessions = {};

router.post("/", async (req, res) => {
  try {
    const { sessionId, role, experience, company, answer } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "Missing sessionId" });
    }

    if (!sessions[sessionId]) {
      sessions[sessionId] = { messages: [] };
    }

    const session = sessions[sessionId];

    // Load RAG safely
    let ragText = "";
    if (role) {
      const ragPath = `./rag/${role}.json`;
      if (fs.existsSync(ragPath)) {
        ragText = JSON.parse(fs.readFileSync(ragPath)).join("\n");
      }
    }

    if (answer) {
      session.messages.push({ role: "user", content: answer });
    }

    const systemPrompt = `
You are an AI Interview Coach.
Role: ${role}
Experience: ${experience} years
Target company: ${company || "General"}

Rules:
- Ask ONE question at a time
- Build follow-ups from user's last answer
- Do NOT repeat questions
- Sound human, not robotic
- Probe deeper if answer is vague

Knowledge Base:
${ragText}
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...session.messages
      ],
      temperature: 0.7
    });

    if (!completion.choices || !completion.choices.length) {
      throw new Error("LLM returned no choices");
    }

    const question = completion.choices[0].message.content;
    session.messages.push({ role: "assistant", content: question });

    res.json({ question });

  } catch (err) {
    console.error("Interview error:", err.message);
    res.status(500).json({ error: "Interview generation failed" });
  }
});

export default router;
