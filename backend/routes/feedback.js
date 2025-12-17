import express from "express";
import Groq from "groq-sdk";

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post("/", async (req, res) => {
  try {
    const { transcript = "" } = req.body;

    const completion = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [
        {
          role: "system",
          content: `
You are an interview coach.
Return ONLY valid JSON.
No markdown.
JSON format:
{
 "scores": { "communication":0-10, "clarity":0-10, "confidence":0-10 },
 "strengths": [],
 "weaknesses": [],
 "improvements": []
}
`
        },
        { role: "user", content: transcript }
      ]
    });

    const text = completion.choices[0].message.content;
    const json = JSON.parse(text);

    res.json(json);
  } catch (err) {
    console.error("Feedback error:", err.message);
    res.status(500).json({ error: "Feedback generation failed" });
  }
});

export default router;
