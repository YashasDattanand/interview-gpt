import express from "express";
import fs from "fs";
import path from "path";
import { groq } from "../utils/groq.js";

const router = express.Router();

router.post("/next", async (req, res) => {
  const { role, experience, company, history, lastAnswer } = req.body;

  const ragPath = path.resolve(`backend/rag/${role}.json`);
  const ragData = JSON.parse(fs.readFileSync(ragPath, "utf-8"));

  const prompt = `
You are a human interviewer.

Candidate experience: ${experience}
Target company: ${company || "General"}
Key skills: ${ragData.skills.join(", ")}

Conversation so far:
${history}

Latest answer:
"${lastAnswer}"

Decide ONE of the following:
- Ask a follow-up question if the answer is weak or vague
- Probe deeper if answer is good
- Move to next topic naturally

Ask only ONE question. Be conversational.
`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }]
  });

  res.json({ question: completion.choices[0].message.content });
});

export default router;
