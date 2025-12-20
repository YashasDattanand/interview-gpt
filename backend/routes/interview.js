import express from "express";
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post("/", async (req, res) => {
  try {
    const { messages } = req.body;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages,
    });

    res.json({
      reply: completion.choices[0].message.content,
    });
  } catch (err) {
    console.error("Interview error:", err);
    res.status(500).json({ error: "Interview failed" });
  }
});

export default router;
