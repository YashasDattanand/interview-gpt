import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export default async function interview(req, res) {
  try {
    const { role, experience, company, conversation } = req.body;

    if (!role || !experience || !company) {
      return res.status(400).json({ error: "Missing setup info" });
    }

    const systemPrompt = `
You are an interview coach.
Role: ${role}
Experience: ${experience}
Company: ${company}

Ask ONE relevant interview question.
Never repeat previous questions.
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        ...conversation
      ]
    });

    res.json({
      question: completion.choices[0].message.content
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Interview failed" });
  }
}
