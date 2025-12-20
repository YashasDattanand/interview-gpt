import express from "express";
import Groq from "groq-sdk";

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Hard truncate to avoid 413
const clip = (text, max = 2500) =>
  text.length > max ? text.slice(0, max) : text;

router.post("/analyze", async (req, res) => {
  try {
    const { resumeText, jdText } = req.body;
    if (!resumeText || !jdText)
      return res.status(400).json({ error: "Missing data" });

    const prompt = `
You are an expert recruiter.

Return STRICT JSON:
{
  "score": number,
  "company_looking_for": string[],
  "strengths": string[],
  "weaknesses": string[],
  "opportunities": string[],
  "threats": string[],
  "section_scores": {
    "strengths": number,
    "weaknesses": number,
    "opportunities": number,
    "threats": number
  }
}

Resume:
${clip(resumeText)}

Job Description:
${clip(jdText)}
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2
    });

    const json = JSON.parse(completion.choices[0].message.content);
    res.json(json);
  } catch (e) {
    console.error("Resume JD Error:", e);
    res.status(500).json({ error: "Resume JD failed" });
  }
});

export default router;
