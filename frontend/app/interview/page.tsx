"use client";

import { useRef, useState } from "react";

export default function Page() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [recording, setRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }

    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = e => {
      chunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      setVideoBlob(blob);
      chunksRef.current = [];
    };

    mediaRecorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    const tracks = (videoRef.current?.srcObject as MediaStream)
      ?.getTracks();
    tracks?.forEach(track => track.stop());
    setRecording(false);
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>Mock Interview (Video)</h1>

      <video
        ref={videoRef}
        autoPlay
        muted
        style={{ width: "400px", marginBottom: 12 }}
      />

      <div>
        {!recording && (
          <button onClick={startRecording}>Start Interview</button>
        )}
        {recording && (
          <button onClick={stopRecording}>End Interview</button>
        )}
      </div>

      {videoBlob && (
        <p>Video recorded. Ready for analysis.</p>
      )}
    </main>
  );
}
