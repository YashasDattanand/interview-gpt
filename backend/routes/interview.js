import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// ensure uploads folder exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// configure multer
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const name = `interview-${Date.now()}.webm`;
    cb(null, name);
  }
});

const upload = multer({ storage });

// upload endpoint
router.post("/upload", upload.single("video"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No video received" });
  }

  res.json({
    success: true,
    file: req.file.filename
  });
});

export default router;
