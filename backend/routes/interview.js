import express from "express";
import fetch from "node-fetch";
import fs from "fs";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { role, experience, company, conversation, userText } = req.body;

    const ragPath = `./rag/${role}.json`;
    const ragData = fs.existsSync(ragPath)
      ? JSON.parse(fs.readFileSync(ragPath, "utf-8"))
      : [];

    const systemPrompt = `
You are a professional interview coach.
Role: ${role}
Experience: ${experience}
Company: ${company}

Ask ONE clear interview question at a time.
Never repeat questions.
Ask follow-ups based on previous answers.
`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversation
    ];

    if (userText) {
      messages.push({ role: "user", content: userText });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages
      })
    });

    const data = await response.json();
    const question = data.choices?.[0]?.message?.content;

    res.json({ question });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Interview failed" });
  }
});

export default router;
