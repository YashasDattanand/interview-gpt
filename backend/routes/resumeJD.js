import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.post("/", async (req, res) => {
  const { resume, jd } = req.body;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama3-70b-8192",
      messages: [
        { role: "system", content: "Compare resume vs JD and give gaps." },
        { role: "user", content: `Resume:\n${resume}\nJD:\n${jd}` }
      ]
    })
  });

  const data = await response.json();
  res.json({ analysis: data.choices[0].message.content });
});

export default router;
