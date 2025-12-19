import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import resumeJDRoute from "./routes/resumeJD.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/resume-jd", resumeJDRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Backend running on port", PORT);
});
