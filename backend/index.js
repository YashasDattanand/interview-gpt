import express from "express";
import cors from "cors";

import interviewRoutes from "./routes/interview.js";
import feedbackRoutes from "./routes/feedback.js";

const app = express();

app.use(cors());
app.use(express.json());

/**
 * ✅ ROUTER MOUNTING (THIS WAS BROKEN)
 */
app.use("/interview", interviewRoutes);
app.use("/feedback", feedbackRoutes);

app.get("/", (req, res) => {
  res.send("InterviewGPT backend running");
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
