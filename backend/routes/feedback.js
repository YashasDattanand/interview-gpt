import express from "express";
const router = express.Router();

router.post("/", (req, res) => {
  res.json({
    scores: {
      clarity: 7,
      structure: 6,
      confidence: 8
    },
    strengths: ["Clear communication", "Confidence"],
    weaknesses: ["Needs more structure"],
    improvements: ["Use STAR method", "Be more concise"]
  });
});

export default router;
