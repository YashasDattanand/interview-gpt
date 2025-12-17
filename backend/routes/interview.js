import express from "express";
import fs from "fs";
import fetch from "node-fetch";

const router = express.Router();

router.post("/next", async (req, res) => {
  const { role, experience, company, history } = req.body;

  if (!role) {
    return res.status(400).json({
      error: "Role is missing from request body"
    });
  }

  const filePath = `./rag/${role}.json`;

  if (!fs.existsSync(filePath)) {
    return res.status(400).json({
      error: `RAG file not found for role: ${role}`
    });
  }

  const roleData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  // 🔹 RAG: retrieve relevant chunks
  const retrieved = roleData.contexts.filter(c =>
    (c.company === company || c.company === "General") &&
    (experience === c.experience || c.experience === "0-2")
  );

  // 🔹 Build LLM prompt
  const prompt = `
You are a professional interview coach.

Candidate role: ${role}
Experience level: ${experience}
Target company: ${company}

Relevant interview context:
${JSON.stringify(retrieved, null, 2)}

Conversation so far:
${history.join("\n")}

Rules:
- Ask ONE question only
- Build on the candidate’s last answer
- Probe deeper if answer is shallow
- Be conversational, not robotic
- Do not repeat earlier questions
`;

  const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama3-8b-8192",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    })
  });

  const data = await groqRes.json();
  const question = data.choices[0].message.content;

  res.json({ question });
});

export default router;

