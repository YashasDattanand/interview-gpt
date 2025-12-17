import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.post("/", async (req, res) => {
  const { transcript } = req.body;

  const prompt = `
Analyze this interview transcript.
Give structured feedback with:
- scores (communication, clarity, confidence out of 10)
- strengths
- weaknesses
- improvements

Transcript:
${transcript}

Return STRICT JSON.
`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama3-70b-8192",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3
    })
  });

  const data = await response.json();

  try {
    const json = JSON.parse(data.choices[0].message.content);
    res.json(json);
  } catch {
    res.status(500).json({ error: "Feedback parsing failed" });
  }
});

export default router;
