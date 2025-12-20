import express from "express";
import { scoreResumeJD } from "../utils/resumeScoring.js";

const router = express.Router();

router.post("/analyze", async (req, res) => {
  try {
    const { resumeText, jdText } = req.body;

    if (!resumeText || !jdText) {
      return res.status(400).json({ error: "Missing input text" });
    }

    const result = scoreResumeJD(resumeText, jdText);
    res.json(result);

  } catch (err) {
    console.error("Resume JD Error:", err);
    res.status(500).json({ error: "Resume JD analysis failed" });
  }
});

export default router;
