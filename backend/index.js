// ===============================
// CORE IMPORTS
// ===============================
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ===============================
// ENV SETUP
// ===============================
dotenv.config();
console.log("GROQ_API_KEY =", process.env.GROQ_API_KEY);

// Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===============================
// APP INIT
// ===============================
const app = express();

// ===============================
// MIDDLEWARE
// ===============================
app.use(
  cors({
    origin: "*", // MVP only
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
  })
);

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true }));

// ===============================
// ENSURE UPLOADS FOLDER EXISTS
// ===============================
const uploadsPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath);
}

// ===============================
// ROUTES IMPORT
// ===============================
import authRoutes from "./routes/auth.js";
import resumeRoutes from "./routes/resume.js";
import interviewRoutes from "./routes/interview.js";
import feedbackRoutes from "./routes/feedback.js";
import uploadRoutes from "./routes/upload.js";

// ===============================
// ROUTES REGISTER
// ===============================
app.get("/", (req, res) => {
  res.send("InterviewGPT Backend is running 🚀");
});

app.use("/auth", authRoutes);
app.use("/resume", resumeRoutes);
app.use("/interview", interviewRoutes);
app.use("/feedback", feedbackRoutes);
app.use("/upload", uploadRoutes);

// ===============================
// GLOBAL ERROR HANDLER
// ===============================
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message
  });
});

// ===============================
// START SERVER
// ===============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});
