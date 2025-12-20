import express from "express";
import multer from "multer";
import fs from "fs";
import pdf from "pdf-parse";
import Groq from "groq-sdk";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// HARD LIMIT — token safe
function safeText(text, maxChars = 2000) {
  return text.replace(/\s+/g, " ").slice(0, maxChars);
}

async function extractText(file) {
  if (file.mimetype === "application/pdf") {
    const buffer = fs.readFileSync(file.path);
    const data = await pdf(buffer);
    return data.text || "";
  }
  return fs.readFileSync(file.path, "utf8");
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

      let resumeText = await extractText(req.files.resume[0]);
      let jdText = await extractText(req.files.jd[0]);

      // 🔒 HARD SAFETY
      resumeText = safeText(resumeText);
      jdText = safeText(jdText);

      const prompt = `
You are an expert recruiter.

Compare the RESUME with the JOB DESCRIPTION.

Return STRICT JSON ONLY:

{
  "score": 0-100,
  "company_looking_for": [],
  "strengths": [],
  "weaknesses": [],
  "opportunities": [],
  "threats": [],
  "phrase_improvements": [
    { "original": "", "suggested": "" }
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

      const output = completion.choices[0].message.content;

      let parsed;
      try {
        parsed = JSON.parse(output);
      } catch {
        return res.status(500).json({ error: "Invalid JSON from LLM", output });
      }

      res.json(parsed);
    } catch (err) {
      console.error("Resume JD Error:", err);
      res.status(500).json({ error: "Backend failed" });
    }
  }
);

export default router;
