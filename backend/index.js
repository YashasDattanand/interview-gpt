import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import interviewRoutes from "./routes/interview.js";
import feedbackRoutes from "./routes/feedback.js";
import resumeRoutes from "./routes/resume.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_, res) => {
  res.send("InterviewGPT Backend Running");
});

app.use("/interview", interviewRoutes);
app.use("/feedback", feedbackRoutes);
app.use("/resume", resumeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Backend running on port ${PORT}`)
);
