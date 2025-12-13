import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Load env variables
dotenv.config();

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes
import authRoutes from "./routes/auth.js";
import resumeRoutes from "./routes/resume.js";
import interviewRoutes from "./routes/interview.js";
import feedbackRoutes from "./routes/feedback.js";
import uploadRoutes from "./routes/upload.js";

// Create app
const app = express();

// =====================
// MIDDLEWARE
// =====================

// CORS (allow frontend to talk to backend)
app.use(
  cors({
    origin: "*", // for MVP; restrict later
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
  })
);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Ensure uploads folder exists (for PDF uploads)
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// =====================
// ROUTES
// =====================

app.get("/", (req, res) => {
  res.send("InterviewGPT Backend is running 🚀");
});

app.use("/auth", authRoutes);           // signup / login
app.use("/resume", resumeRoutes);       // resume ↔ JD matcher
app.use("/interview", interviewRoutes); // AI interviewer (RAG)
app.use("/feedback", feedbackRoutes);   // scoring + feedback
app.use("/upload", uploadRoutes);       // resume/JD upload

// =====================
// ERROR HANDLING
// =====================

app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);
  res.status(500).json({
    error: "Internal Server Error",
    details: err.message
  });
});

// =====================
// START SERVER
// =====================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});
