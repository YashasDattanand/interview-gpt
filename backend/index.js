import express from "express";
import cors from "cors";

// ROUTES
import authRoutes from "./routes/auth.js";
import interviewRoutes from "./routes/interview.js";
import interviewFlowRoutes from "./routes/interviewFlow.js";
import feedbackRoutes from "./routes/feedback.js";

// INIT APP FIRST (THIS WAS THE BUG)
const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// ROUTES (AFTER app IS CREATED)
app.use("/auth", authRoutes);
app.use("/interview", interviewRoutes);
app.use("/interview-flow", interviewFlowRoutes);
app.use("/feedback", feedbackRoutes);

// HEALTH CHECK
app.get("/", (req, res) => {
  res.send("InterviewGPT Backend Running ✅");
});

// START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
