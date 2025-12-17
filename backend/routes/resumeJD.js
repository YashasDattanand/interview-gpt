import express from "express";
import multer from "multer";
import pdf from "pdf-parse";
import fetch from "node-fetch";

const router = express.Router();
const upload = multer();

router.post("/", upload.fields([
  { name: "resume" },
  { name: "jd" }
]), async (req, res) => {

  const resumeText = (await pdf(req.files.resume[0].buffer)).text;
  const jdText = (await pdf(req.files.jd[0].buffer)).text;

  const prompt = `
Compare the resume and JD below.

Resume:
${resumeText}

Job Description:
${jdText}

Return JSON with:
matchScore (0-100), gaps, suggestions.
`;

  const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama3-8b-8192",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2
    })
  });

  const data = await groqRes.json();
  res.json(JSON.parse(data.choices[0].message.content));
});

export default router;
