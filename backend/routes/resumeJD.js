import express from "express";
import multer from "multer";
import Groq from "groq-sdk";

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
        return res.status(400).json({ error: "Resume or JD missing" });
      }

      const resumeText = req.files.resume[0].buffer.toString("utf-8");
      const jdText = req.files.jd[0].buffer.toString("utf-8");

      const prompt = `
You are an expert recruiter.

Compare the RESUME and JOB DESCRIPTION below.

Return:
1. Overall match score out of 100
2. SWOT analysis
3. Company expectations
4. Phrase-level resume improvements

RESUME:
${resumeText}

JOB DESCRIPTION:
${jdText}

Return STRICT JSON:
{
  "score": number,
  "strengths": [],
  "weaknesses": [],
  "opportunities": [],
  "threats": [],
  "company_looks_for": [],
  "phrase_suggestions": []
}
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
      console.error("Resume-JD Error:", err);
      res.status(500).json({ error: "Analysis failed" });
    }
  }
);

export default router;
