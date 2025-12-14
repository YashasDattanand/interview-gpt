import express from "express";
const router = express.Router();

let conversation = [];

router.post("/start", (req, res) => {
  conversation = [];
  res.json({
    role: "Coach",
    message: "Tell me about yourself."
  });
});

router.post("/next", (req, res) => {
  const { answer } = req.body;

  if (!answer) {
    return res.status(400).json({ error: "Answer required" });
  }

  conversation.push(answer);

  res.json({
    role: "Coach",
    message: "What brings you here today?"
  });
});

export default router;
