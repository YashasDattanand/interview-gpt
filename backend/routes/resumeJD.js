import express from "express";
import Groq from "groq-sdk";

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post("/analyze", async (req, res) => {
  try {
    const { resumeText, jdText } = req.body;

    if (!resumeText || !jdText) {
      return res.status(400).json({ error: "Missing resume or JD text" });
    }

    const prompt = `
You are an expert recruiter and hiring manager.

TASK:
1. Compare the resume against the job description.
2. Score the candidate realistically (not harshly).
3. Provide:
   - Overall score out of 100
   - Dimension-wise scores (0-10)
   - SWOT analysis
   - Phrase-level improvements
   - What this company is really looking for

SCORING DIMENSIONS:
- Role Skill Fit
- Domain / Industry Fit
- Seniority & Scope
- Impact & Outcomes
- Tooling / Hard Skills

Resume:
${resumeText}

Job Description:
${jdText}

Return JSON ONLY in this format:
{
  "overallScore": number,
  "scores": {
    "roleFit": number,
    "domainFit": number,
    "seniority": number,
    "impact": number,
    "tools": number
  },
  "strengths": [],
  "weaknesses": [],
  "opportunities": [],
  "threats": [],
  "companyExpectations": [],
  "phraseLevelSuggestions": [
    {
      "original": "",
      "improved": ""
    }
  ]
}
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3
    });

    const raw = completion.choices[0].message.content;
    const json = JSON.parse(raw);

    res.json(json);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Resume-JD analysis failed" });
  }
});

export default router;
