"use client";

import { useEffect, useRef, useState } from "react";

type QA = { question: string; answer: string };

enum MicState {
  LISTENING,
  WAITING
}

export default function Page() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);
  const startTimeRef = useRef<number | null>(null);

  const [history, setHistory] = useState<QA[]>([]);
  const [currentQ, setCurrentQ] = useState("");
  const [answer, setAnswer] = useState("");
  const [micState, setMicState] = useState<MicState>(MicState.LISTENING);
  const [ended, setEnded] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [duration, setDuration] = useState(0);

  const role = "Product Manager";

  // ⏱ Interview timer
  useEffect(() => {
    if (!startTimeRef.current || ended) return;
    const id = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTimeRef.current!) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [ended]);

  // 🔊 Speak question
  const speak = (text: string) => {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    speechSynthesis.speak(u);
  };

  // 🎤 Start listening
  const startListening = () => {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    const recognition = new SR();
    recognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (e: any) => {
      let text = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        text += e.results[i][0].transcript;
      }

      if (!startTimeRef.current) startTimeRef.current = Date.now();

      setAnswer(prev => prev + " " + text);
      resetSilenceTimer();
    };

    recognition.onend = () => {
      if (micState === MicState.LISTENING) {
        recognition.start(); // keep alive
      }
    };

    recognition.start();
    setMicState(MicState.LISTENING);
    resetSilenceTimer();
  };

  const resetSilenceTimer = () => {
    clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      stopListening();
    }, 8000);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setMicState(MicState.WAITING);
  };

  // 🎥 Video recording (whole interview)
  const startVideo = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
    if (videoRef.current) videoRef.current.srcObject = stream;

    const recorder = new MediaRecorder(stream);
    recorderRef.current = recorder;

    recorder.ondataavailable = e => e.data.size && chunksRef.current.push(e.data);
    recorder.start();
  };

  // 🔁 Fetch next question
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
    setAnswer("");
    startListening();
  };

  const submit = async () => {
    stopListening();
    const newHistory = [...history, { question: currentQ, answer }];
    setHistory(newHistory);
    await nextQuestion(newHistory);
  };

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

    const data = await res.json();
    setFeedback(data);
  };

  useEffect(() => {
    startVideo();
    nextQuestion([]);
  }, []);

  return (
    <main style={{ maxWidth: 1100, margin: "auto", padding: 24 }}>
      <h1>GLIM AI Mock Interview</h1>
      <p>⏱ Duration: {duration}s</p>

      <video ref={videoRef} autoPlay muted width={360} />

      <div style={{ height: 300, overflowY: "auto", border: "1px solid #ccc", padding: 16 }}>
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
        placeholder="Speak or type your answer"
      />

      <br />

      {micState === MicState.WAITING && (
        <button onClick={startListening}>🎤 Start Speaking</button>
      )}

      <button onClick={submit}>Submit Answer</button>
      <button onClick={endInterview} style={{ marginLeft: 8 }}>
        End Interview
      </button>

      {feedback && (
        <>
          <h2>Feedback</h2>
          {Object.entries(feedback.scores).map(([k, v]: any) => (
            <div key={k}>
              {k}
              <div style={{ background: "#eee", height: 10 }}>
                <div style={{ width: `${v * 20}%`, background: "#4caf50", height: 10 }} />
              </div>
            </div>
          ))}
        </>
      )}
    </main>
  );
}
