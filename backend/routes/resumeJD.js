import express from "express";
import Groq from "groq-sdk";

const router = express.Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

router.post("/analyze", async (req, res) => {
  try {
    const { resumeText, jdText } = req.body;

    if (!resumeText || !jdText) {
      return res.status(400).json({ error: "Missing resume or JD text" });
    }

    const prompt = `
Compare the resume and job description below.

Resume:
${resumeText}

Job Description:
${jdText}

Return STRICT JSON with:
{
  score: number (0–100),
  company_looking_for: string[],
  strengths: string[],
  weaknesses: string[],
  opportunities: string[],
  threats: string[]
}
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2
    });

    const raw = completion.choices[0].message.content;

    // 🔒 SAFE JSON PARSE
    const jsonStart = raw.indexOf("{");
    const jsonEnd = raw.lastIndexOf("}");
    const parsed = JSON.parse(raw.slice(jsonStart, jsonEnd + 1));

    res.json(parsed);
  } catch (err) {
    console.error("Resume JD Error:", err);
    res.status(500).json({ error: "Resume analysis failed" });
  }
});

export default router;
