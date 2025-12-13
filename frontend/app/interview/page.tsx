"use client";

import { useEffect, useRef, useState } from "react";

type QA = { question: string; answer: string };

export default function Page() {
  const [role] = useState("Product Manager");
  const [currentQ, setCurrentQ] = useState("");
  const [answer, setAnswer] = useState("");
  const [history, setHistory] = useState<QA[]>([]);
  const [ended, setEnded] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);

  // === FETCH NEXT QUESTION ===
  const fetchNext = async (newHistory: QA[]) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/interview-flow/next`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, history: newHistory })
      }
    );

    const data = await res.json();

    if (data.done) {
      setEnded(true);
      return;
    }

    setCurrentQ(data.question);
  };

  // === SUBMIT ANSWER ===
  const submitAnswer = async () => {
    if (!answer) return;

    const newHistory = [...history, { question: currentQ, answer }];
    setHistory(newHistory);
    setAnswer("");

    await fetchNext(newHistory);
  };

  // === END INTERVIEW ===
  const endInterview = async () => {
    setEnded(true);

    const transcript = history
      .map(h => `Q: ${h.question}\nA: ${h.answer}`)
      .join("\n");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/feedback`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, role })
      }
    );

    const data = await res.json();
    setFeedback(data);
  };

  // === INIT ===
  useEffect(() => {
    fetchNext([]);
  }, []);

  return (
    <main style={{ padding: 24, maxWidth: 800 }}>
      <h1>GLIM Mock Interview</h1>

      {!ended && (
        <>
          <h3>Interviewer</h3>
          <p>{currentQ}</p>

          <textarea
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            placeholder="Type your answer"
          />

          <br />
          <button onClick={submitAnswer}>Submit Answer</button>
          <button onClick={endInterview} style={{ marginLeft: 8 }}>
            End Interview
          </button>
        </>
      )}

      {ended && feedback && (
        <>
          <h2>Final Feedback</h2>
          <pre>{JSON.stringify(feedback, null, 2)}</pre>
        </>
      )}
    </main>
  );
}
