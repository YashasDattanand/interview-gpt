import express from "express";
import Groq from "groq-sdk";

const router = express.Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

router.post("/analyze", async (req, res) => {
  try {
    let { resumeText, jdText } = req.body;

    if (!resumeText || !jdText) {
      return res.status(400).json({ error: "Missing resume or JD text" });
    }

    // 🔒 Guard against filename-only input
    if (resumeText.endsWith(".pdf") || jdText.endsWith(".pdf")) {
      return res.json({
        score: 8,
        company_looking_for: ["Relevant role experience", "Domain alignment"],
        strengths: ["Basic profile present"],
        weaknesses: ["Resume content not parsed"],
        opportunities: ["Enable text extraction for better analysis"],
        threats: ["Inaccurate scoring without resume text"]
      });
    }

    resumeText = resumeText.slice(0, 2000);
    jdText = jdText.slice(0, 2000);

    const prompt = `
Return ONLY valid JSON. No explanation.

{
  "score": number (0-100),
  "company_looking_for": string[],
  "strengths": string[],
  "weaknesses": string[],
  "opportunities": string[],
  "threats": string[]
}

Resume:
${resumeText}

JD:
${jdText}
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0
    });

    const raw = completion.choices[0].message.content.trim();

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      console.error("Non-JSON from model:", raw);
      return res.status(500).json({ error: "Invalid model response" });
    }

    parsed.score = Math.max(0, Math.min(100, Math.round(parsed.score)));

    res.json(parsed);

  } catch (err) {
    console.error("Resume JD Error:", err);
    res.status(500).json({ error: "Resume analysis failed" });
  }
});

export default router;
