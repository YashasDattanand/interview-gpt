import express from "express";
import Groq from "groq-sdk";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

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

      const resumeText = req.files.resume[0].buffer.toString("utf-8");
      const jdText = req.files.jd[0].buffer.toString("utf-8");

      const prompt = `
You are an expert recruiter and hiring manager.

Compare the RESUME and JOB DESCRIPTION below.

Return STRICT JSON in this format:
{
  "score": number (0-100),
  "company_looking_for": [string],
  "strengths": [string],
  "weaknesses": [string],
  "opportunities": [string],
  "threats": [string],
  "phrase_level_improvements": [
    {
      "original": string,
      "suggested": string,
      "reason": string
    }
  ]
}

RESUME:
${resumeText}

JOB DESCRIPTION:
${jdText}
`;

      const completion = await groq.chat.completions.create({
        model: "llama-3.1-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2
      });

      const raw = completion.choices[0].message.content;
      const json = JSON.parse(raw);

      res.json(json);
    } catch (err) {
      console.error("Resume JD Error:", err);
      res.status(500).json({ error: "Resume–JD analysis failed" });
    }
  }
);

export default router;
