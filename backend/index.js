import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import interview from "./routes/interview.js";
import feedback from "./routes/feedback.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/interview", interview);
app.post("/feedback", feedback);

app.listen(5000, () => {
  console.log("Backend running on port 5000");
});
