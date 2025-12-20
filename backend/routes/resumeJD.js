import express from "express";
import multer from "multer";
import fs from "fs";
import Groq from "groq-sdk";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// helper: limit text size
function trimText(text, maxChars = 4000) {
  if (!text) return "";
  return text.length > maxChars ? text.slice(0, maxChars) : text;
}

// helper: summarize long text
async function summarize(text, label) {
  const res = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "user",
        content: `Summarize the following ${label} into key skills, experience, and themes (bullet points):\n\n${text}`
      }
    ],
    temperature: 0.2
  });

  return res.choices[0].message.content;
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
        return res.status(400).json({ error: "Resume or JD missing" });
      }

      let resumeText = fs.readFileSync(req.files.resume[0].path, "utf8");
      let jdText = fs.readFileSync(req.files.jd[0].path, "utf8");

      // hard trim BEFORE summarization
      resumeText = trimText(resumeText);
      jdText = trimText(jdText);

      // summarize both (THIS IS THE FIX)
      const resumeSummary = await summarize(resumeText, "resume");
      const jdSummary = await summarize(jdText, "job description");

      const prompt = `
You are an expert recruiter.

Compare the RESUME SUMMARY and JOB DESCRIPTION SUMMARY.

Return STRICT JSON:
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

RESUME SUMMARY:
${resumeSummary}

JOB DESCRIPTION SUMMARY:
${jdSummary}
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
        return res.status(500).json({
          error: "Invalid JSON from LLM",
          raw
        });
      }

      res.json(parsed);

    } catch (err) {
      console.error("Resume JD Error:", err);
      res.status(500).json({ error: "Backend failed" });
    }
  }
);

export default router;
