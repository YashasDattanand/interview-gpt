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
  const [uploading, setUploading] = useState(false);

  // Speech recognition
  let recognition: any;

  const startSpeechToText = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    recognition = new SpeechRecognition();
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
    (window as any).recognition = recognition;
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }

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
    startSpeechToText();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    (window as any).recognition?.stop();

    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(t => t.stop());

    setRecording(false);
  };

  const uploadVideo = async () => {
    if (!videoBlob) return alert("No video");

    setUploading(true);
    const fd = new FormData();
    fd.append("video", videoBlob);

    await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/interview/upload`,
      { method: "POST", body: fd }
    );

    setUploading(false);
    alert("Video uploaded");
  };

  const getFeedback = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/feedback`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript })
      }
    );

    const data = await res.json();
    setFeedback(data);
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>Video Interview</h1>

      <video
        ref={videoRef}
        autoPlay
        muted
        style={{ width: 420, border: "1px solid #ccc" }}
      />

      <div>
        {!recording && <button onClick={startRecording}>Start</button>}
        {recording && <button onClick={stopRecording}>Stop</button>}
      </div>

      {videoBlob && (
        <button onClick={uploadVideo} disabled={uploading}>
          Upload Video
        </button>
      )}

      {transcript && (
        <>
          <h3>Transcript</h3>
          <p>{transcript}</p>
          <button onClick={getFeedback}>Get AI Feedback</button>
        </>
      )}

      {feedback && (
        <>
          <h3>Scores</h3>
          <pre>{JSON.stringify(feedback, null, 2)}</pre>
        </>
      )}
    </main>
  );
}
