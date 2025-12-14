import express from "express";
import multer from "multer";
import pdf from "pdf-parse";

const router = express.Router();
const upload = multer();

router.post("/", upload.fields([
  { name: "resume" },
  { name: "jd" }
]), async (req, res) => {

  const resumeText = (await pdf(req.files.resume[0].buffer)).text;
  const jdText = (await pdf(req.files.jd[0].buffer)).text;

  res.json({
    matchScore: 72,
    gaps: ["Leadership examples missing", "Limited metrics"],
    suggestions: ["Add impact numbers", "Highlight stakeholder management"]
  });
});

export default router;
