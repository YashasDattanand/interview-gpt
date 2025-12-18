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
You are an interview coach.
Role: ${role}
Experience: ${experience}
Company: ${company || "General"}

Ask one non-repeating interview question at a time.
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        ...(conversation || []),
      ],
    });

    const question = completion.choices[0].message.content;
    res.json({ question });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Interview failed" });
  }
});

export default router;
