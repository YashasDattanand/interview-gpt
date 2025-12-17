import express from "express";
import fs from "fs";
import path from "path";
import Groq from "groq-sdk";

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post("/", async (req, res) => {
  try {
    const {
      role = "general",
      experience = "0-2",
      company = "general",
      history = [],
      answer = ""
    } = req.body;

    // SAFE RAG FILE LOAD
    let ragData = "";
    try {
      const ragPath = path.resolve(
        `./rag/${role.toLowerCase()}.json`
      );
      ragData = fs.readFileSync(ragPath, "utf-8");
    } catch {
      ragData = "General interview questions.";
    }

    const messages = [
      {
        role: "system",
        content: `
You are a human interview coach.
Do NOT repeat questions.
Ask follow-ups if answers are weak.
Adapt based on role (${role}), experience (${experience}), company (${company}).
Use RAG data when useful:
${ragData}
`
      },
      ...history,
      ...(answer
        ? [{ role: "user", content: answer }]
        : [])
    ];

    const completion = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages,
      temperature: 0.7
    });

    if (
      !completion ||
      !completion.choices ||
      !completion.choices[0]
    ) {
      throw new Error("LLM response malformed");
    }

    const question = completion.choices[0].message.content;

    res.json({
      question,
      history: [
        ...history,
        ...(answer
          ? [{ role: "user", content: answer }]
          : []),
        { role: "assistant", content: question }
      ]
    });
  } catch (err) {
    console.error("Interview error:", err.message);
    res.status(500).json({ error: "Interview failed" });
  }
});

export default router;
