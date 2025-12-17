import express from "express";
import fs from "fs";
import Groq from "groq-sdk";

const router = express.Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

router.post("/", async (req, res) => {
  try {
    const { role, experience, company, conversation, userText } = req.body;

    if (!role || !experience) {
      return res.status(400).json({ error: "Missing role or experience" });
    }

    // Load RAG file safely
    let ragContext = "";
    try {
      ragContext = fs.readFileSync(`./rag/${role}.json`, "utf-8");
    } catch {
      ragContext = "General interview questions.";
    }

    const messages = [];

    messages.push({
      role: "system",
      content: `
You are a professional interview coach.
Role: ${role}
Experience level: ${experience}
Target company: ${company || "General"}

Use this context:
${ragContext}

Rules:
- Ask ONE question at a time
- Build follow-up questions based on user answers
- Do NOT repeat questions
- Be natural and conversational
`
    });

    if (Array.isArray(conversation)) {
      conversation.forEach(msg => {
        if (typeof msg.content === "string") {
          messages.push({
            role: msg.role,
            content: msg.content
          });
        }
      });
    }

    if (userText && typeof userText === "string") {
      messages.push({
        role: "user",
        content: userText
      });
    }

    const completion = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages
    });

    if (
      !completion ||
      !completion.choices ||
      !completion.choices[0] ||
      !completion.choices[0].message
    ) {
      throw new Error("Invalid LLM response");
    }

    const question = completion.choices[0].message.content;

    res.json({ question });

  } catch (err) {
    console.error("Interview error:", err.message);
    res.status(500).json({ error: "Interview failed" });
  }
});

export default router;
