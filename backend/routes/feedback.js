import express from "express";

const router = express.Router();

router.post("/", async (req, res) => {
  const { transcript } = req.body;

  res.json({
    scores: {
      clarity: 7,
      structure: 6,
      depth: 6,
      relevance: 7
    },
    strengths: [
      "Clear communication",
      "Relevant examples"
    ],
    weaknesses: [
      "Could add metrics",
      "Needs better structure"
    ],
    improvements: [
      "Use STAR framework",
      "Quantify impact"
    ]
  });
});

export default router;
