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

    // HARD LIMIT to avoid 413
    resumeText = resumeText.slice(0, 2000);
    jdText = jdText.slice(0, 2000);

    const prompt = `
Return ONLY valid JSON. No explanations. No markdown.

JSON format:
{
  "score": number,
  "company_looking_for": string[],
  "strengths": string[],
  "weaknesses": string[],
  "opportunities": string[],
  "threats": string[]
}

Resume:
${resumeText}

Job Description:
${jdText}
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0
    });

    const raw = completion.choices[0].message.content.trim();

    // 🛡️ SAFE PARSE (NO MORE CRASHES)
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      console.error("Raw LLM output (non-JSON):", raw);
      return res.status(500).json({
        error: "Model returned invalid JSON",
        raw
      });
    }

    // Normalize score
    if (parsed.score <= 1) {
      parsed.score = Math.round(parsed.score * 100);
    }

    res.json(parsed);

  } catch (err) {
    console.error("Resume JD Fatal Error:", err);
    res.status(500).json({ error: "Resume analysis failed" });
  }
});

export default router;
