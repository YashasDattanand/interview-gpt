import express from "express";
import fs from "fs";

const router = express.Router();

router.post("/next", async (req, res) => {
  const { role, experience, company, history } = req.body;

  const roleData = JSON.parse(
    fs.readFileSync(`./rag/${role}.json`, "utf-8")
  );

  const question =
    roleData.questions[Math.floor(Math.random() * roleData.questions.length)];

  res.json({
    question: company
      ? `${question} (specifically in context of ${company})`
      : question
  });
});

export default router;
