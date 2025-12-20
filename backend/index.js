import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import interviewRoute from "./routes/interview.js";
import feedbackRoute from "./routes/feedback.js";
import resumeJDRoute from "./routes/resumeJD.js"; // ✅ NEW

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.use("/interview", interviewRoute);
app.use("/feedback", feedbackRoute);
app.use("/resume-jd", resumeJDRoute); // ✅ NEW

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Backend running on port", PORT));
