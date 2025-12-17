import express from "express";
import fs from "fs";
import fetch from "node-fetch";

const router = express.Router();

router.post("/next", async (req, res) => {
  const { role, company, experience, history } = req.body;

  if (!role) {
    return res.status(400).json({ error: "Role is required" });
  }

  // 🔒 SAFE RAG LOAD
  let ragText = "";
  try {
    ragText = fs.readFileSync(`./rag/${role}.json`, "utf8");
  } catch {
    ragText = "General interview questions.";
  }

  const systemPrompt = `
You are an experienced interview coach.

Rules:
- Ask ONE question at a time
- Ask follow-ups if the answer is shallow
- Do NOT repeat questions
- Tailor to role=${role}, experience=${experience}, company=${company}

RAG Context:
${ragText}
`;

  const messages = [
    { role: "system", content: systemPrompt },
    ...history
  ];

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama3-70b-8192",
      messages,
      temperature: 0.7
    })
  });

  const data = await response.json();

  if (!data.choices) {
    return res.status(500).json({ error: "LLM failed", raw: data });
  }

  res.json({
    question: data.choices[0].message.content
  });
});

export default router;
