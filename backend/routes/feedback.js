import express from "express";
import Groq from "groq-sdk";

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post("/", async (req, res) => {
  try {
    const { transcript } = req.body;

    if (!transcript) {
      return res.status(400).json({ error: "Missing transcript" });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-70b-versatile",
      messages: [{
        role: "system",
        content: `
Evaluate this interview.
Return STRICT JSON with:
scores: communication, clarity, confidence (1-10)
strengths, weaknesses, improvements arrays
`
      },{
        role: "user",
        content: transcript
      }],
      temperature: 0.3
    });

    const raw = completion.choices[0].message.content;
    const json = JSON.parse(raw);

    res.json(json);

  } catch (err) {
    console.error("Feedback error:", err.message);
    res.status(500).json({ error: "Feedback generation failed" });
  }
});

export default router;
