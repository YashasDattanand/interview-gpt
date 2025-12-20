import express from "express";
import Groq from "groq-sdk";

const router = express.Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// hard safety caps
const MAX_TEXT_CHARS = 3500;

const clip = (text = "") =>
  text.replace(/\s+/g, " ").slice(0, MAX_TEXT_CHARS);

router.post("/analyze", async (req, res) => {
  try {
    let { resumeText, jdText } = req.body;

    if (!resumeText || !jdText) {
      return res.status(400).json({ error: "Missing resume or JD text" });
    }

    resumeText = clip(resumeText);
    jdText = clip(jdText);

    const messages = [
      {
        role: "system",
        content: `
You are an ATS-style resume evaluator.

Return STRICT JSON in this format ONLY:
{
  "score": number (0-100),
  "company_looking_for": string[],
  "strengths": string[],
  "weaknesses": string[],
  "opportunities": string[],
  "threats": string[]
}
        `
      },
      {
        role: "user",
        content: `
JOB DESCRIPTION:
${jdText}

RESUME:
${resumeText}
        `
      }
    ];

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages,
      temperature: 0.3
    });

    const raw = completion.choices[0].message.content;

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return res.status(500).json({ error: "Invalid AI response" });
    }

    res.json(parsed);
  } catch (err) {
    console.error("Resume JD Error:", err.message);
    res.status(500).json({ error: "Resume analysis failed" });
  }
});

export default router;
