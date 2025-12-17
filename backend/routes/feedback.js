import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { conversation } = req.body;

    const prompt = `
Analyze this interview and return JSON:
{
 "scores": { "communication":0-10,"clarity":0-10,"confidence":0-10 },
 "strengths": [],
 "improvements": []
}
`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: JSON.stringify(conversation) }
        ]
      })
    });

    const data = await response.json();
    res.json(JSON.parse(data.choices[0].message.content));

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Feedback generation failed" });
  }
});

export default router;
