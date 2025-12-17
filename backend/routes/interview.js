import express from "express";
import fs from "fs";
import fetch from "node-fetch";

const router = express.Router();

router.post("/next", async (req, res) => {
  try {
    const { role, experience, company, history = [] } = req.body;

    if (!role) {
      return res.status(400).json({ error: "Role missing" });
    }

    const ragPath = `./rag/${role}.json`;
    if (!fs.existsSync(ragPath)) {
      return res.status(400).json({ error: "RAG file not found" });
    }

    const rag = JSON.parse(fs.readFileSync(ragPath, "utf-8"));

    // fallback question from RAG
    let fallbackQuestion =
      rag.contexts?.[0]?.sample_questions?.[0] ||
      "Tell me about yourself.";

    // build prompt
    const messages = [
      {
        role: "system",
        content: `You are a professional interview coach. 
Ask one question at a time. 
Probe deeper if the answer is weak.
Be conversational, not robotic.`
      },
      ...history,
      {
        role: "user",
        content: "Ask the next interview question."
      }
    ];

    // Call LLM
    const llmResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages,
        temperature: 0.7
      })
    });

    const data = await llmResponse.json();

    console.log("LLM RAW RESPONSE:", JSON.stringify(data));

    // SAFE EXTRACTION
    let question = fallbackQuestion;
    if (data?.choices?.length > 0) {
      question = data.choices[0].message.content;
    }

    res.json({ question });

  } catch (err) {
    console.error("Interview error:", err);
    res.json({
      question: "Let's continue. Can you tell me about a challenge you've handled?"
    });
  }
});

export default router;
