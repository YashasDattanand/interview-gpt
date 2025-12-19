import { groq } from "../utils/groq.js";

export default async function feedback(req, res) {
  try {
    const { conversation } = req.body;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `
Respond ONLY with valid JSON in this format:
{
  "overallScore": number,
  "communication": number,
  "clarity": number,
  "confidence": number,
  "strengths": [],
  "weaknesses": [],
  "improvements": []
}
`
        },
        { role: "user", content: JSON.stringify(conversation) }
      ]
    });

    const raw = completion.choices[0].message.content;
    const json = JSON.parse(raw);

    res.json(json);

  } catch (err) {
    console.error("Feedback error:", err);
    res.status(500).json({ error: "Feedback generation failed" });
  }
}
