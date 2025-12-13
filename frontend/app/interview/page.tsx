"use client";

import { useRef, useState } from "react";

export default function Page() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [recording, setRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // ===== SPEECH TO TEXT =====
  let recognition: any;

  const startSpeech = () => {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    recognition = new SR();
    recognition.continuous = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let text = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        text += event.results[i][0].transcript + " ";
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
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = e => {
      if (e.data.size) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      setVideoBlob(blob);
      chunksRef.current = [];
    };

    recorder.start();
    startSpeech();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    (window as any).rec?.stop();

    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(t => t.stop());

    setRecording(false);
  };

  // ===== AI FEEDBACK (GROQ) =====
  const getAIFeedback = async () => {
    if (!transcript) return alert("Transcript empty");

    setLoading(true);
    setFeedback(null);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/feedback`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          role: "Product Manager",
          level: "PGPM Student"
        })
      }
    );

    const data = await res.json();
    setFeedback(data);
    setLoading(false);
  };

  return (
    <main style={{ padding: 24, maxWidth: 900 }}>
      <h1>Video Interview</h1>

      <video
        ref={videoRef}
        autoPlay
        muted
        style={{ width: 420, border: "1px solid #ccc" }}
      />

      <div style={{ margin: "10px 0" }}>
        {!recording && <button onClick={startRecording}>Start</button>}
        {recording && <button onClick={stopRecording}>Stop</button>}
      </div>

      {transcript && (
        <>
          <h3>Transcript</h3>
          <p>{transcript}</p>

          <button onClick={getAIFeedback}>
            {loading ? "Analyzing..." : "Get AI Feedback"}
          </button>
        </>
      )}

      {feedback && (
        <>
          <h2>AI Feedback</h2>

          <h4>Scores</h4>
          <ul>
            <li>Clarity: {feedback.scores?.clarity}/5</li>
            <li>Structure: {feedback.scores?.structure}/5</li>
            <li>Relevance: {feedback.scores?.relevance}/5</li>
            <li>Confidence: {feedback.scores?.confidence}/5</li>
          </ul>

          <h4>Strengths</h4>
          <ul>{feedback.strengths?.map((s: string, i: number) => <li key={i}>{s}</li>)}</ul>

          <h4>Weaknesses</h4>
          <ul>{feedback.weaknesses?.map((w: string, i: number) => <li key={i}>{w}</li>)}</ul>

          <h4>Improvements</h4>
          <ul>{feedback.improvements?.map((im: string, i: number) => <li key={i}>{im}</li>)}</ul>

          <p><b>Overall:</b> {feedback.overall_feedback}</p>
        </>
      )}
    </main>
  );
}
