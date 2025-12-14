import express from "express";
const router = express.Router();

let turn = 0;

const starterQuestion = "Tell me about yourself.";
const followUps = [
  "Can you go a bit deeper into that?",
  "What challenges did you face?",
  "What was your impact?",
  "How would you improve that experience?"
];

router.post("/start", (req, res) => {
  turn = 0;
  res.json({ question: starterQuestion });
});

router.post("/next", (req, res) => {
  const { answer } = req.body;

  if (!answer || answer.trim().length === 0) {
    return res.json({ question: "Please try answering the question." });
  }

  turn++;

  if (turn >= followUps.length) {
    return res.json({ done: true });
  }

  res.json({ question: followUps[turn] });
});

export default router;
