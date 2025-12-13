import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import interviewRoutes from "./routes/interview.js";
import feedbackRoutes from "./routes/feedback.js";
import interviewFlowRoutes from "./routes/interviewFlow.js";
app.use("/interview-flow", interviewFlowRoutes);

const app = express();

app.use(cors());
app.use(express.json());

// routes
app.use("/auth", authRoutes);
app.use("/interview", interviewRoutes);
app.use("/feedback", feedbackRoutes);

// health check
app.get("/", (req, res) => {
  res.send("InterviewGPT Backend is running 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

