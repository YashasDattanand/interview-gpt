import express from "express";
import fs from "fs";

const router = express.Router();
const FILE = "./rag/crowd/glim_students.json";

router.post("/upload", (req, res) => {
  const { company, role, questions } = req.body;

  if (!company || !role || !questions?.length) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const data = JSON.parse(fs.readFileSync(FILE, "utf-8"));

  data.push({
    company,
    role,
    questions,
    year: new Date().getFullYear()
  });

  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));

  res.json({ success: true });
});

export default router;
