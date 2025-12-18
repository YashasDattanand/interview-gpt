import express from "express";
import fs from "fs";
import Groq from "groq-sdk";

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post("/", async (req, res) => {
  try {
    const { role, experience, company, conversation } = req.body;

    if (!role || !experience) {
      return res.status(400).json({ error: "Missing role or experience" });
    }

    // Load RAG
    let rag = [];
    const ragPath = `./rag/${role}.json`;
    if (fs.existsSync(ragPath)) {
      rag = JSON.parse(fs.readFileSync(ragPath, "utf8"));
    }

    const systemPrompt = `
You are an experienced interview coach.
Role: ${role}
Experience: ${experience} years
Target company: ${company || "General"}

Rules:
- Ask ONE question at a time
- Do NOT repeat questions
- Start with introduction, then role basics, then deeper questions
- Follow up based on user's last answer
- Be natural and conversational
`;

    const messages = [
      { role: "system", content: systemPrompt },
      {
        role: "system",
        content: `Relevant interview questions:\n${rag
          .map((q, i) => `${i + 1}. ${q}`)
          .join("\n")}`,
      },
      ...(conversation || []),
    ];

    const completion = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages,
      temperature: 0.7,
    });

    const question = completion.choices[0].message.content;
    res.json({ question });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Interview failed" });
  }
});

export default router;
