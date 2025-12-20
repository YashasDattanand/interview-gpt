import express from "express";
import multer from "multer";
import fs from "fs";
import Groq from "groq-sdk";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// HARD safety cap
function hardTrim(text, maxChars = 2500) {
  return text.length > maxChars ? text.slice(0, maxChars) : text;
}

router.post(
  "/analyze",
  upload.fields([
    { name: "resume", maxCount: 1 },
    { name: "jd", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      if (!req.files?.resume || !req.files?.jd) {
        return res.status(400).json({ error: "Files missing" });
      }

      let resumeText = fs.readFileSync(req.files.resume[0].path, "utf8");
      let jdText = fs.readFileSync(req.files.jd[0].path, "utf8");

      // HARD TRIM — this is the key
      resumeText = hardTrim(resumeText);
      jdText = hardTrim(jdText);

      const prompt = `
You are an expert recruiter and resume evaluator.

Analyze the RESUME against the JOB DESCRIPTION.

Return STRICT JSON ONLY:
{
  "score": number (0-100),
  "company_looking_for": [strings],
  "strengths": [strings],
  "weaknesses": [strings],
  "opportunities": [strings],
  "threats": [strings],
  "phrase_improvements": [
    { "original": string, "suggested": string }
  ]
}

RESUME:
${resumeText}

JOB DESCRIPTION:
${jdText}
`;

      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2
      });

      const raw = completion.choices[0].message.content;

      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        return res.status(500).json({ error: "Invalid JSON from LLM", raw });
      }

      res.json(parsed);
    } catch (err) {
      console.error("Resume JD Error:", err);
      res.status(500).json({ error: "Backend failed" });
    }
  }
);

export default router;
