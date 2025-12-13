import express from "express";
import fs from "fs";
import { groq } from "../utils/groq.js";

const router = express.Router();

function loadRag(role, company) {
  let context = "";

  try {
    context += fs.readFileSync(`./rag/roles/${role}.json`, "utf-8");
  } catch {}

  if (company) {
    try {
      context += "\n" + fs.readFileSync(`./rag/companies/${company}.json`, "utf-8");
    } catch {}
  }

  return context;
}

router.post("/next", async (req, res) => {
  try {
    const { role, experience, company, history } = req.body;

    const ragContext = loadRag(role, company);
    const crowd = JSON.parse(
  fs.readFileSync("./rag/crowd/glim_students.json", "utf-8")
);

const crowdQs = crowd
  .filter(q => q.role === role && q.company === company)
  .flatMap(q => q.questions)
  .join("\n");

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: `
You are a real human interviewer.

Rules:
- Ask ONE question at a time
- If the candidate answer is vague, ask a follow-up
- If they give a claim, ask for an example
- If answer is strong, move forward
- Never sound robotic
- Be conversational and adaptive
`
        },
        {
          role: "user",
          content: `
Candidate details:
Role: ${role}
Experience: ${experience}
Target company: ${company || "General"}

Reference interview areas (do NOT read verbatim):
${ragContext}

Conversation so far:
${history}

Decide the next best interview question.
`
        }
      ]
    });

    res.json({ question: completion.choices[0].message.content.trim() });
  } catch (err) {
    console.error("Interview flow error:", err.message);
    res.status(500).json({ error: "Interview flow failed" });
  }
});

export default router;
