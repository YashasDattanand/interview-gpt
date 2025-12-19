import express from "express";
import Groq from "groq-sdk";

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post("/", async (req, res) => {
  try {
    const { conversation, earlyExit } = req.body;

    const userTurns = conversation.filter(m => m.role === "user").length;

    let penaltyNote = "";
    let penalty = 0;

    if (userTurns < 3) {
      penalty = 2;
      penaltyNote =
        "Interview ended early. Scores reduced due to limited responses.";
    }

    const prompt = `
You are an interview evaluator.

Conversation:
${conversation.map(m => `${m.role}: ${m.content}`).join("\n")}

Return STRICT JSON:
{
  "scores": {
    "communication": number (0-10),
    "clarity": number (0-10),
    "confidence": number (0-10)
  },
  "strengths": [string],
  "weaknesses": [string],
  "improvements": [string]
}

If interview is short, penalize scores.
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4
    });

    let result = JSON.parse(completion.choices[0].message.content);

    // ⬇️ Apply penalty safely
    for (let k in result.scores) {
      result.scores[k] = Math.max(0, result.scores[k] - penalty);
    }

    if (penaltyNote) {
      result.improvements.unshift(penaltyNote);
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      scores: { communication: 3, clarity: 3, confidence: 3 },
      strengths: ["Attempted the interview"],
      weaknesses: ["Interview ended too early"],
      improvements: ["Complete the full interview next time"]
    });
  }
});

export default router;
