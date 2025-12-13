"use client";

import { useEffect, useRef, useState } from "react";

type QA = { question: string; answer: string };

export default function InterviewPage() {
  // ===== Refs =====
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const endedRef = useRef(false);

  // ===== State =====
  const [history, setHistory] = useState<QA[]>([]);
  const [currentQ, setCurrentQ] = useState("");
  const [answer, setAnswer] = useState("");
  const [listening, setListening] = useState(false);
  const [duration, setDuration] = useState(0);
  const [ended, setEnded] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [showUpload, setShowUpload] = useState(false);

  const role = "Product Manager";

  // ===== TIMER =====
  const startTimer = () => {
    if (startTimeRef.current) return;
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTimeRef.current!) / 1000));
    }, 1000);
  };

  // ===== CAMERA =====
  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
    streamRef.current = stream;
    if (videoRef.current) videoRef.current.srcObject = stream;

    const recorder = new MediaRecorder(stream);
    recorderRef.current = recorder;

    recorder.ondataavailable = e => e.data.size && chunksRef.current.push(e.data);
    recorder.start();
  };

  // ===== SPEECH =====
  const speak = (text: string) => {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    speechSynthesis.speak(u);
  };

  const startListening = () => {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    const recognition = new SR();
    recognitionRef.current = recognition;

    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      setAnswer(text);
      startTimer();
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
    setListening(true);

    setTimeout(() => {
      recognition.stop();
    }, 8000);
  };

  // ===== INTERVIEW FLOW =====
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

  // ===== END INTERVIEW =====
  const endInterview = async () => {
    if (endedRef.current) return;
    endedRef.current = true;

    recorderRef.current?.stop();
    streamRef.current?.getTracks().forEach(t => t.stop());
    timerRef.current && clearInterval(timerRef.current);

    setEnded(true);
    setShowUpload(true);
  };

  const generateFeedback = async () => {
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

    setFeedback(await res.json());
    setShowUpload(false);
  };

  // ===== INIT =====
  useEffect(() => {
    startCamera();
    nextQuestion([]);
  }, []);

  // ===== UI =====
  return (
    <div style={{ padding: 24 }}>
      <h2>Product Manager Interview</h2>
      <p>Duration: {duration}s</p>

      <div style={{ display: "flex", gap: 24 }}>
        {/* LEFT */}
        <div style={{ width: 320 }}>
          <video ref={videoRef} autoPlay muted style={{ width: "100%" }} />
          <button onClick={startListening} disabled={listening}>
            🎤 {listening ? "Listening..." : "Start Speaking"}
          </button>
        </div>

        {/* RIGHT */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              height: 300,
              overflowY: "auto",
              border: "1px solid #ddd",
              padding: 12
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

          <input
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            placeholder="Type your answer"
            style={{ width: "100%", marginTop: 8 }}
          />

          <div style={{ marginTop: 8 }}>
            <button onClick={submitAnswer}>Send</button>
            <button onClick={endInterview} style={{ marginLeft: 8 }}>
              End Interview
            </button>
          </div>
        </div>
      </div>

      {showUpload && (
        <div>
          <h3>Upload interview video?</h3>
          <button onClick={generateFeedback}>Skip & Get Feedback</button>
        </div>
      )}

      {feedback && (
        <div>
          <h2>Feedback</h2>
          {Object.entries(feedback.scores).map(([k, v]: any) => (
            <div key={k}>
              {k}
              <div style={{ background: "#eee", height: 8 }}>
                <div
                  style={{
                    width: `${v * 20}%`,
                    height: 8,
                    background: "#22c55e"
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
