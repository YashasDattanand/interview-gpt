import express from "express";
import fs from "fs";
import { groq } from "../utils/groq.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { role, experience, company, conversation } = req.body;

    if (!role || !experience) {
      return res.status(400).json({ error: "Missing role or experience" });
    }

    const rag = JSON.parse(
      fs.readFileSync(`./rag/${role}.json`, "utf-8")
    );

    let contextQuestions = [...rag.intro];

    if (experience === "0-1") contextQuestions.push(...rag.beginner);
    if (company === "Google") contextQuestions.push(...rag.company_google);

    const systemPrompt = `
You are a human interview coach.
Ask ONE natural interview question at a time.
Build on what the user says.
Never repeat questions.
`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversation,
      {
        role: "assistant",
        content: `Choose one relevant question from:\n${contextQuestions.join("\n")}`
      }
    ];

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages
    });

    const question = completion.choices[0].message.content;

    res.json({ question });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Interview failed" });
  }
});

export default router;
