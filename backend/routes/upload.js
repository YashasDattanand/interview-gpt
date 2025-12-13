import express from "express";
import multer from "multer";
import pdf from "pdf-parse";
import fs from "fs";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.fields([
  { name: "resume" },
  { name: "jd" }
]), async (req, res) => {
  const resumeFile = req.files.resume?.[0];
  const jdFile = req.files.jd?.[0];

  const extractText = async (file) => {
    if (file.mimetype === "application/pdf") {
      const data = await pdf(fs.readFileSync(file.path));
      return data.text;
    }
    return fs.readFileSync(file.path, "utf8");
  };

  const resumeText = await extractText(resumeFile);
  const jdText = await extractText(jdFile);

  res.json({ resumeText, jdText });
});

export default router;
