import express from "express";
import { groq } from "../utils/groq.js";

const router = express.Router();

function extractJSON(text) {
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first === -1 || last === -1) {
    throw new Error("Invalid JSON from LLM");
  }
  return JSON.parse(text.slice(first, last + 1));
}

router.post("/match", async (req, res) => {
  try {
    const { resumeText, jdText } = req.body;

    if (!resumeText || !jdText) {
      return res.status(400).json({ error: "Missing resume or JD" });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: `
You are an ATS + hiring manager.
Be strict, realistic, and detailed.
Return JSON only.
`
        },
        {
          role: "user",
          content: `
Resume:
${resumeText}

Job Description:
${jdText}

Return JSON ONLY:
{
  "match_score": number,
  "matched_keywords": [string],
  "missing_keywords": [string],
  "resume_improvements": [string]
}
`
        }
      ]
    });

    res.json(extractJSON(completion.choices[0].message.content));
  } catch (err) {
    console.error("Resume match error:", err.message);
    res.status(500).json({ error: "Resume matching failed" });
  }
});

export default router;
