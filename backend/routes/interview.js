import express from "express";
import Groq from "groq-sdk";

const router = express.Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

router.post("/", async (req, res) => {
  try {
    const { role, experience, company, conversation } = req.body;

    if (!role || !experience) {
      return res.status(400).json({ error: "Missing role or experience" });
    }

    const systemPrompt = `
You are an experienced interview coach.
You are interviewing a candidate for the role of ${role}.
Experience level: ${experience} years.
Target company: ${company || "General"}.

Rules:
- Ask ONE question at a time
- Ask follow-up questions based on the user's last answer
- Do NOT repeat the same question
- Be natural and conversational
`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(conversation || []),
    ];

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages,
      temperature: 0.7,
    });

    const question =
      completion.choices?.[0]?.message?.content ||
      "Let's continue. Can you elaborate on your previous answer?";

    res.json({ question });
  } catch (err) {
    console.error("Interview error:", err);
    res.status(500).json({ error: "Interview failed" });
  }
});

export default router;
