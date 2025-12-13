import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// routes
app.use("/auth", authRoutes);

// health check
app.get("/", (req, res) => {
  res.send("InterviewGPT Backend is running 🚀");
});

// start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
