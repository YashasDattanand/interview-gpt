import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import resumeRoutes from "./routes/resume.js";
import interviewRoutes from "./routes/interview.js";
import feedbackRoutes from "./routes/interviewFeedback.js";
import uploadRoutes from "./routes/upload.js";
import feedbackRoutes from "./routes/feedback.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/upload", uploadRoutes);
app.use("/auth", authRoutes);
app.use("/resume", resumeRoutes);
app.use("/interview", interviewRoutes);
app.use("/feedback", feedbackRoutes);

app.listen(5000, () => console.log("Backend running on port 5000"));
