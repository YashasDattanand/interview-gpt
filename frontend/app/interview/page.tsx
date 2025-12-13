"use client";

import { useRef, useState } from "react";

export default function Page() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [recording, setRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [uploading, setUploading] = useState(false);

  // START RECORDING
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        setVideoBlob(blob);
        chunksRef.current = [];
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      alert("Camera or microphone access denied");
    }
  };

  // STOP RECORDING
  const stopRecording = () => {
    mediaRecorderRef.current?.stop();

    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());

    setRecording(false);
  };

  // UPLOAD VIDEO TO BACKEND
  const uploadVideo = async () => {
    if (!videoBlob) {
      alert("No video recorded");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("video", videoBlob);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/interview/upload`,
        {
          method: "POST",
          body: formData
        }
      );

      const data = await res.json();

      if (data.success) {
        alert("Video uploaded successfully");
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (err) {
      alert("Error uploading video");
    } finally {
      setUploading(false);
    }
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>Mock Interview (Video)</h1>

      <video
        ref={videoRef}
        autoPlay
        muted
        style={{
          width: "420px",
          height: "320px",
          border: "1px solid #ccc",
          marginBottom: "12px"
        }}
      />

      <div style={{ marginBottom: 12 }}>
        {!recording && (
          <button onClick={startRecording}>
            🎥 Start Interview
          </button>
        )}

        {recording && (
          <button onClick={stopRecording}>
            ⏹ End Interview
          </button>
        )}
      </div>

      {videoBlob && (
        <div>
          <p>✅ Video recorded</p>
          <button onClick={uploadVideo} disabled={uploading}>
            {uploading ? "Uploading..." : "⬆️ Upload for Analysis"}
          </button>
        </div>
      )}
    </main>
  );
}
