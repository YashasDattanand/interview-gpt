"use client";

import { useEffect, useRef, useState } from "react";

type QA = { question: string; answer: string };

export default function Page() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [role] = useState("Product Manager");
  const [history, setHistory] = useState<QA[]>([]);
  const [currentQ, setCurrentQ] = useState("");
  const [answer, setAnswer] = useState("");
  const [listening, setListening] = useState(false);
  const [ended, setEnded] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);

  let recognition: any;
  let silenceTimer: any;

  // 🎙 Speak question
  const speak = (text: string) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    speechSynthesis.speak(u);
  };

  // 🎧 Listen for answer (8s silence)
  const listen = () => {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    recognition = new SR();
    recognition.continuous = true;
    recognition.lang = "en-US";

    recognition.onresult = (e: any) => {
      let text = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        text += e.results[i][0].transcript + " ";
      }
      setAnswer(text);
      resetTimer();
    };

    recognition.start();
    setListening(true);
    startTimer();
  };

  const startTimer = () => {
    silenceTimer = setTimeout(stopListening, 8000);
  };

  const resetTimer = () => {
    clearTimeout(silenceTimer);
    startTimer();
  };

  const stopListening = () => {
    recognition?.stop();
    setListening(false);
  };

  // 🎥 Start full interview recording
  const startVideo = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });

    if (videoRef.current) videoRef.current.srcObject = stream;

    const recorder = new MediaRecorder(stream);
    recorderRef.current = recorder;

    recorder.ondataavailable = e => {
      if (e.data.size) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      setVideoBlob(new Blob(chunksRef.current, { type: "video/webm" }));
    };

    recorder.start();
  };

  // 🔁 Next question
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
    speak(data.question);
    listen();
  };

  const submit = async () => {
    stopListening();
    const newHistory = [...history, { question: currentQ, answer }];
    setHistory(newHistory);
    setAnswer("");
    await nextQuestion(newHistory);
  };

  // 🛑 End interview
  const endInterview = async () => {
    stopListening();
    recorderRef.current?.stop();
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

    setFeedback(await res.json());
  };

  useEffect(() => {
    startVideo();
    nextQuestion([]);
  }, []);

  return (
    <main style={{ maxWidth: 900, margin: "auto", padding: 24 }}>
      <h1>GLIM AI Mock Interview</h1>

      <video ref={videoRef} autoPlay muted width={320} />

      {!ended && (
        <>
          <div style={{ border: "1px solid #ddd", padding: 16 }}>
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
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            placeholder="Speak or type your answer"
          />

          <br />
          <button onClick={submit}>Submit Answer</button>
          <button onClick={endInterview} style={{ marginLeft: 8 }}>
            End Interview
          </button>

          {listening && <p>🎤 Listening…</p>}
        </>
      )}

      {ended && feedback && (
        <>
          <h2>Feedback</h2>
          <p>{feedback.summary}</p>

          {Object.entries(feedback.scores).map(([k, v]: any) => (
            <div key={k}>
              <b>{k}</b>
              <div style={{ background: "#eee", height: 8 }}>
                <div
                  style={{
                    width: `${v * 20}%`,
                    background: "#4caf50",
                    height: 8
                  }}
                />
              </div>
            </div>
          ))}

          <h3>Improvements</h3>
          <ul>
            {feedback.improvements.map((i: string, idx: number) => (
              <li key={idx}>{i}</li>
            ))}
          </ul>

          {videoBlob && (
            <p>
              🎥 Interview recorded. Upload feature can be enabled later.
            </p>
          )}
        </>
      )}
    </main>
  );
}
