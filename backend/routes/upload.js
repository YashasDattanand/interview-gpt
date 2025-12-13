import express from "express";
import multer from "multer";
import fs from "fs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post(
  "/",
  upload.fields([
    { name: "resume", maxCount: 1 },
    { name: "jd", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const resumeFile = req.files.resume?.[0];
      const jdFile = req.files.jd?.[0];

      if (!resumeFile || !jdFile) {
        return res.status(400).json({ error: "Resume and JD required" });
      }

      const extractText = async (file) => {
        if (file.mimetype === "application/pdf") {
          const dataBuffer = fs.readFileSync(file.path);
          const data = await pdfParse(dataBuffer);
          return data.text;
        } else {
          return fs.readFileSync(file.path, "utf8");
        }
      };

      const resumeText = await extractText(resumeFile);
      const jdText = await extractText(jdFile);

      res.json({ resumeText, jdText });
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      res.status(500).json({ error: "Failed to process files" });
    }
  }
);

export default router;
