import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { transcript = [] } = req.body;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          {
            role: "system",
            content: `Evaluate interview performance.
Return JSON only with:
scores, strengths, weaknesses, improvements`
          },
          {
            role: "user",
            content: transcript.map(t => `${t.role}: ${t.content}`).join("\n")
          }
        ]
      })
    });

    const data = await response.json();

    let result = {
      scores: { communication: 6, clarity: 6, confidence: 6 },
      strengths: ["Clear responses"],
      weaknesses: ["Needs structure"],
      improvements: ["Use STAR method"]
    };

    if (data?.choices?.length > 0) {
      try {
        result = JSON.parse(data.choices[0].message.content);
      } catch {}
    }

    res.json(result);

  } catch (err) {
    console.error("Feedback error:", err);
    res.json({
      scores: { communication: 5, clarity: 5, confidence: 5 },
      strengths: ["Participated actively"],
      weaknesses: ["Incomplete answers"],
      improvements: ["Provide examples"]
    });
  }
});

export default router;
