import express from "express";
import cors from "cors";

const app = express();

/* 🔥 THIS IS THE MOST IMPORTANT LINE 🔥 */
app.use(express.json());

app.use(cors());

app.get("/", (req, res) => {
  res.send("Backend running");
});

app.post("/interview", (req, res) => {
  console.log("REQ BODY:", req.body);

  const { role, experience } = req.body;

  if (!role || !experience) {
    return res.status(400).json({ error: "Missing role or experience" });
  }

  res.json({
    received: req.body,
    question: "This is a test question. Backend JSON works."
  });
});

app.post("/feedback", (req, res) => {
  console.log("FEEDBACK BODY:", req.body);

  if (!Array.isArray(req.body.conversation)) {
    return res.status(400).json({ error: "No conversation provided" });
  }

  res.json({
    scores: {
      communication: 7,
      clarity: 6,
      confidence: 7
    },
    strengths: ["Clear answers"],
    weaknesses: ["Needs structure"],
    improvements: ["Use STAR"]
  });
});

app.listen(5000, () => {
  console.log("Backend running on port 5000");
});
