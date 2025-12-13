import express from "express";
import multer from "multer";
import pdf from "pdf-parse";
import { groq } from "../utils/groq.js";

const router = express.Router();
const upload = multer();

router.post("/analyze", upload.fields([
  { name: "resume" },
  { name: "jd" }
]), async (req, res) => {
  const resumeText = (await pdf(req.files.resume[0].buffer)).text;
  const jdText = (await pdf(req.files.jd[0].buffer)).text;

  const prompt = `
Compare resume and JD.
Return JSON:
match_score (0-100)
missing_skills
resume_improvements
`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{
      role: "user",
      content: `${prompt}\nResume:\n${resumeText}\nJD:\n${jdText}`
    }]
  });

  res.json(JSON.parse(completion.choices[0].message.content));
});

export default router;
