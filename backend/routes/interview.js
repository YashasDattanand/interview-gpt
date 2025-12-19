import express from "express";
import Groq from "groq-sdk";

const router = express.Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

router.post("/", async (req, res) => {
  try {
    const { role, experience, company, conversation } = req.body;

    if (!role || !experience || !company) {
      return res.status(400).json({ error: "Missing setup info" });
    }

    const messages = [
      {
        role: "system",
        content: `
You are an expert interview coach.
Rules:
- Never repeat questions.
- Ask follow-ups based on last answer.
- Start with a warm intro.
- Increase difficulty gradually.
- Stay role-specific.
Role: ${role}
Experience: ${experience}
Company: ${company}
`
      },
      ...(conversation || [])
    ];

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages,
      temperature: 0.7
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Interview failed" });
  }
});

export default router;
