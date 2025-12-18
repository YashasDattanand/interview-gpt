import express from "express";
import cors from "cors";
import interviewRoutes from "./routes/interview.js";
import feedbackRoutes from "./routes/feedback.js";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/interview", interviewRoutes);
app.post("/feedback", feedbackRoutes);

app.listen(5000, () => {
  console.log("Backend running on port 5000");
});
