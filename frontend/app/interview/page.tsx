"use client";

import { useEffect, useRef, useState } from "react";

type QA = { question: string; answer: string };

export default function InterviewPage() {
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);
  const startedRef = useRef(false);

  const [history, setHistory] = useState<QA[]>([]);
  const [currentQ, setCurrentQ] = useState("");
  const [answer, setAnswer] = useState("");
  const [listening, setListening] = useState(false);
  const [ended, setEnded] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [error, setError] = useState("");

  const role = "Product Manager";

  // ---------- SPEAK ----------
  const speak = (text: string) => {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    speechSynthesis.speak(u);
  };

  // ---------- MIC ----------
  const startMic = () => {
    try {
      const SR =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (!SR) {
        alert("Speech Recognition not supported. Use Chrome.");
        return;
      }

      const recognition = new SR();
      recognitionRef.current = recognition;

      recognition.lang = "en-US";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        setAnswer(text);
      };

      recognition.onerror = () => {
        setListening(false);
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognition.start();
      setListening(true);

      silenceTimerRef.current = setTimeout(() => {
        recognition.stop();
      }, 8000);
    } catch (e) {
      setError("Mic error. Refresh and try again.");
    }
  };

  // ---------- FLOW ----------
  const nextQuestion = async (newHistory: QA[]) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/interview-flow/next`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, history: newHistory })
      }
    );

    const data = await res.json();
    setCurrentQ(data.question);
    setAnswer("");
    speak(data.question);
  };

  const submitAnswer = async () => {
    const newHistory = [...history, { question: currentQ, answer }];
    setHistory(newHistory);
    await nextQuestion(newHistory);
  };

  const endInterview = async () => {
    try {
      setEnded(true);

      const transcript = history
        .map(h => `Q: ${h.question}\nA: ${h.answer}`)
        .join("\n");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/feedback`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role, transcript })
        }
      );

      const data = await res.json();
      setFeedback(data);
    } catch {
      setError("Feedback failed. Backend error.");
    }
  };

  // ---------- INIT ----------
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    nextQuestion([]);
  }, []);

  // ---------- UI ----------
  return (
    <div style={{ maxWidth: 900, margin: "auto", padding: 24 }}>
      <h2>AI Mock Interview</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {!ended && (
        <>
          <div
            style={{
              height: 300,
              border: "1px solid #ddd",
              padding: 16,
              overflowY: "auto"
            }}
          >
            {history.map((h, i) => (
              <div key={i}>
                <b>Interviewer:</b> {h.question}
                <br />
                <b>You:</b> {h.answer}
                <hr />
              </div>
            ))}
            <b>Interviewer:</b> {currentQ}
          </div>

          <textarea
            style={{ width: "100%", height: 80 }}
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            placeholder="Type your answer or use mic"
          />

          <div style={{ marginTop: 8 }}>
            <button onClick={startMic} disabled={listening}>
              🎤 {listening ? "Listening..." : "Start Speaking"}
            </button>
            <button onClick={submitAnswer} style={{ marginLeft: 8 }}>
              Submit
            </button>
            <button onClick={endInterview} style={{ marginLeft: 8 }}>
              End Interview
            </button>
          </div>
        </>
      )}

      {ended && feedback && (
        <div>
          <h3>Feedback</h3>
          <pre>{JSON.stringify(feedback, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
