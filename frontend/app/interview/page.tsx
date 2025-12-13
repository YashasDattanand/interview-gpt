"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  role: "ai" | "user";
  content: string;
};

export default function Page() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [role] = useState("Product Manager");
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");

  // ===== SPEECH TO TEXT =====
  let recognition: any;

  const startSpeech = () => {
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
      setTranscript(prev => prev + text);
    };

    recognition.start();
    (window as any).rec = recognition;
  };

  // ===== VIDEO RECORDING =====
  const startRecording = async () => {
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

    recorder.start();
    startSpeech();
    setRecording(true);
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    (window as any).rec?.stop();

    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(t => t.stop());

    setRecording(false);
  };

  // ===== GET NEXT QUESTION =====
  const getNextQuestion = async (answer: string) => {
    const history = messages.reduce((acc: any[], m, i) => {
      if (m.role === "ai" && messages[i + 1]?.role === "user") {
        acc.push({
          question: m.content,
          answer: messages[i + 1].content
        });
      }
      return acc;
    }, []);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/interview-flow/next`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, history })
      }
    );

    const data = await res.json();

    setMessages(prev => [...prev, { role: "ai", content: data.question }]);
  };

  // ===== SEND TEXT ANSWER =====
  const sendTextAnswer = async () => {
    if (!input) return;

    setMessages(prev => [...prev, { role: "user", content: input }]);
    setInput("");
    await getNextQuestion(input);
  };

  // ===== SEND VIDEO ANSWER =====
  const sendVideoAnswer = async () => {
    if (!transcript) return alert("No transcript");

    setMessages(prev => [...prev, { role: "user", content: transcript }]);
    setTranscript("");
    await getNextQuestion(transcript);
  };

  // ===== INIT FIRST QUESTION =====
  useEffect(() => {
    setMessages([{ role: "ai", content: "Let’s start. Tell me about yourself." }]);
  }, []);

  return (
    <main style={{ padding: 24, maxWidth: 900 }}>
      <h1>GLIM Mock Interview</h1>

      <div style={{ border: "1px solid #ccc", padding: 12, minHeight: 300 }}>
        {messages.map((m, i) => (
          <p key={i}>
            <b>{m.role === "ai" ? "Interviewer" : "You"}:</b> {m.content}
          </p>
        ))}
      </div>

      <h3>Answer by Text</h3>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Type your answer..."
      />
      <button onClick={sendTextAnswer}>Send Text</button>

      <h3>OR Answer by Video</h3>
      <video ref={videoRef} autoPlay muted width={320} />

      {!recording && <button onClick={startRecording}>Start Video</button>}
      {recording && <button onClick={stopRecording}>Stop Video</button>}
      <button onClick={sendVideoAnswer}>Send Video Answer</button>

      {transcript && (
        <>
          <h4>Transcript</h4>
          <p>{transcript}</p>
        </>
      )}
    </main>
  );
}
