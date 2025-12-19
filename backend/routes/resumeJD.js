import express from "express";
import multer from "multer";
import Groq from "groq-sdk";
import { extractText } from "../utils/extractText.js";
import { buildPrompt } from "../utils/ragPrompt.js";

const router = express.Router();
const upload = multer();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post(
  "/analyze",
  upload.fields([{ name: "resume" }, { name: "jd" }]),
  async (req, res) => {
    try {
      const resumeText = await extractText(req.files.resume[0]);
      const jdText = await extractText(req.files.jd[0]);

      const prompt = buildPrompt(resumeText, jdText);

      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2
      });

      const json = JSON.parse(completion.choices[0].message.content);
      res.json(json);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Resume JD analysis failed" });
    }
  }
);

export default router;
