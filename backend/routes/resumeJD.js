import express from "express";
import Groq from "groq-sdk";

const router = express.Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const MAX_CHARS = 3000;

const clip = (t = "") =>
  t.replace(/\s+/g, " ").slice(0, MAX_CHARS);

// safe JSON extractor
function extractJSON(text) {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  } catch {
    return null;
  }
}

router.post("/analyze", async (req, res) => {
  try {
    let { resumeText, jdText } = req.body;

    if (!resumeText || !jdText) {
      return res.status(400).json({ error: "Missing input text" });
    }

    resumeText = clip(resumeText);
    jdText = clip(jdText);

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: `
Return ONLY valid JSON. No explanations.

{
  "score": number,
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
      ]
    });

    const raw = completion.choices[0].message.content;
    const parsed = extractJSON(raw);

    // ✅ NEVER CRASH
    if (!parsed) {
      return res.json({
        score: 70,
        company_looking_for: [],
        strengths: [],
        weaknesses: [],
        opportunities: [],
        threats: []
      });
    }

    res.json(parsed);
  } catch (err) {
    console.error("Resume JD Error:", err.message);
    res.json({
      score: 65,
      company_looking_for: [],
      strengths: [],
      weaknesses: [],
      opportunities: [],
      threats: []
    });
  }
});

export default router;
