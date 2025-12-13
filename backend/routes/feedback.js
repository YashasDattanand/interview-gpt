import express from "express";
import { groq } from "../utils/groq.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { role, experience, company, transcript } = req.body;

    if (!transcript || transcript.length < 50) {
      return res.json({
        overall_score: 1,
        verdict: "Insufficient data",
        feedback:
          "You ended the interview too early. Please attempt at least 2–3 questions to receive meaningful feedback."
      });
    }

    const prompt = `
You are an interview evaluator.

Evaluate strictly.
If answers are weak, score low.

Transcript:
${transcript}

Return JSON ONLY in this format:
{
  "overall_score": number (1-5),
  "strengths": string[],
  "weaknesses": string[],
  "improvements": string[]
}
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3
    });

    const raw = completion.choices[0].message.content;
    const jsonStart = raw.indexOf("{");
    const jsonEnd = raw.lastIndexOf("}");

    const parsed = JSON.parse(raw.slice(jsonStart, jsonEnd + 1));
    res.json(parsed);
  } catch (err) {
    console.error("Feedback error:", err);
    res.status(500).json({
      overall_score: 1,
      verdict: "Error",
      feedback: "Unable to generate feedback. Try again."
    });
  }
});

export default router;
