import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.post("/", async (req, res) => {
  const { transcript } = req.body;

  const prompt = `
You are an interview evaluator.

Interview transcript:
${transcript.join("\n")}

Evaluate on:
- Clarity (1-10)
- Structure (1-10)
- Depth (1-10)
- Relevance (1-10)

Return JSON with:
scores, strengths, weaknesses, improvements.
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
      temperature: 0.3
    })
  });

  const data = await groqRes.json();
  res.json(JSON.parse(data.choices[0].message.content));
});

export default router;
