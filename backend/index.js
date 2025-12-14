import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import interviewRoutes from "./routes/interview.js";
import feedbackRoutes from "./routes/feedback.js";
import resumeJDRoutes from "./routes/resumeJD.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/interview", interviewRoutes);
app.use("/feedback", feedbackRoutes);
app.use("/resume-jd", resumeJDRoutes);

app.get("/", (req, res) => {
  res.send("InterviewGPT Backend Running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
