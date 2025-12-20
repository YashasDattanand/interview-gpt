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

    // 🔒 HARD TRIM (critical)
    resumeText = resumeText.slice(0, 2500);
    jdText = jdText.slice(0, 2500);

    const prompt = `
You are an expert ATS + hiring manager.

Analyze the resume against the job description.

Return STRICT JSON ONLY in this format:
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

Job Description:
${jdText}
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3
    });

    const raw = completion.choices[0].message.content;
    const json = JSON.parse(raw);

    res.json(json);
  } catch (err) {
    console.error("Resume JD Error:", err);
    res.status(500).json({ error: "Resume analysis failed" });
  }
});

export default router;
