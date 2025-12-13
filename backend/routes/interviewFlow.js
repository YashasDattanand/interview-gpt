import express from "express";
import { groq } from "../utils/groq.js";
import fs from "fs";

const router = express.Router();

// Load RAG data
const ragData = JSON.parse(
  fs.readFileSync("./rag/glim_questions.json", "utf-8")
);

router.post("/next", async (req, res) => {
  try {
    const { role, experience, company, history, lastAnswer } = req.body;

    // First question (hardcoded, no LLM)
    if (!history || history.length === 0) {
      return res.json({
        question:
          "Tell me about yourself and your background relevant to this role."
      });
    }

    // Build grounding context
    const roleData = ragData[role] || [];
    const companyData =
      company && ragData[`${role}_${company}`]
        ? ragData[`${role}_${company}`]
        : [];

    const context = [...roleData, ...companyData]
      .slice(0, 5)
      .join("\n");

    const prompt = `
You are a human interviewer.

Rules:
- Ask ONE question only.
- No explanations.
- No feedback.
- If answer is weak, probe deeper.
- If answer is strong, increase difficulty.
- Be conversational, not robotic.

Candidate last answer:
"${lastAnswer}"

Interview context:
${context}

Return ONLY the next interview question as plain text.
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    });

    const question = completion.choices[0].message.content
      .replace(/[\n\r]/g, " ")
      .trim();

    return res.json({ question });
  } catch (err) {
    console.error("Interview flow error:", err);
    res.status(500).json({
      question:
        "Let's move on. Can you describe a challenging situation you handled?"
    });
  }
});

export default router;
