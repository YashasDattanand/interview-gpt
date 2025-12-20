import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import interviewRoute from "./routes/interview.js";
import feedbackRoute from "./routes/feedback.js";
import resumeJDRoute from "./routes/resumeJD.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" })); // ⬅️ increase safely

app.use("/interview", interviewRoute);
app.use("/feedback", feedbackRoute);
app.use("/resume-jd", resumeJDRoute); // ⬅️ resume isolated

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Backend running on port", PORT));
