import express from "express";
import fs from "fs";
import Groq from "groq-sdk";

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post("/", async (req, res) => {
  const { role, experience, company, conversation, plan } = req.body;

  if (!role || !experience) {
    return res.status(400).json({ error: "Missing role or experience" });
  }

  const ragPath = `./rag/${role}.json`;
  const rag = JSON.parse(fs.readFileSync(ragPath, "utf8"));

  const systemPrompt = `
You are a professional interview coach.

Interview context:
Role: ${role}
Company: ${company || "General"}
Experience: ${experience}

Interview plan:
${JSON.stringify(plan, null, 2)}

Rules:
- Ask ONE question at a time
- Increase difficulty gradually
- Do not repeat questions
- Follow the interview sections strictly
- Be concise but realistic
`;

  const messages = [
    { role: "system", content: systemPrompt },
    ...conversation
  ];

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages,
    temperature: 0.6
  });

  const reply = completion.choices[0].message.content;

  res.json({ reply });
});

export default router;
