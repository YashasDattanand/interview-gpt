import express from "express";
import Groq from "groq-sdk";

const router = express.Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// HARD LIMIT to stay under Groq token cap
const MAX_CHARS = 1800;

function clip(text = "") {
  return text.length > MAX_CHARS ? text.slice(0, MAX_CHARS) : text;
}

router.post("/analyze", async (req, res) => {
  try {
    let { resumeText, jdText } = req.body;

    if (!resumeText || !jdText) {
      return res.status(400).json({ error: "Missing resume or JD text" });
    }

    // 🔒 FINAL SAFETY CLIP (THIS FIXES 413)
    resumeText = clip(resumeText);
    jdText = clip(jdText);

    const prompt = `
You are an expert hiring manager.

Compare the RESUME and JOB DESCRIPTION.

Return STRICT JSON with this shape:
{
  "score": number (0-100),
  "company_looking_for": string[],
  "strengths": string[],
  "weaknesses": string[],
  "opportunities": string[],
  "threats": string[],
  "section_scores": {
    "Strengths": number,
    "Weaknesses": number,
    "Opportunities": number,
    "Threats": number
  }
}

RESUME:
${resumeText}

JOB DESCRIPTION:
${jdText}
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3
    });

    // Parse safely
    const raw = completion.choices[0].message.content;
    const json = JSON.parse(raw);

    res.json(json);
  } catch (err) {
    console.error("Resume JD Error:", err);
    res.status(500).json({ error: "Resume analysis failed" });
  }
});

export default router;
