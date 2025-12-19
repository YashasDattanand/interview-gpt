import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import interviewRoutes from "./routes/interview.js";
import feedbackRoutes from "./routes/feedback.js";
import resumeJDRoutes from "./routes/resumeJD.js";

dotenv.config();

const app = express();

/**
 * Middleware
 * NOTE: DO NOT use express.json() globally
 * because resume-jd uses multipart/form-data (multer)
 */
app.use(cors());

/**
 * Routes
 */
app.use("/interview", interviewRoutes);
app.use("/feedback", feedbackRoutes);
app.use("/resume-jd", resumeJDRoutes);

/**
 * Health check (optional but useful)
 */
app.get("/", (req, res) => {
  res.send("InterviewGPT Backend is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
