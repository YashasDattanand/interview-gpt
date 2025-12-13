"use client";

import { useEffect, useRef, useState } from "react";

export default function InterviewPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);

  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Welcome! Let’s start your interview.\n\nQuestion 1: Explain REST vs GraphQL."
    }
  ]);
  const [input, setInput] = useState("");

  // 🎥 Initialize Camera + Mic
  useEffect(() => {
    async function initMedia() {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    }
    initMedia();
  }, []);

  // 🎙️ Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported. Use Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let finalText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalText += event.results[i][0].transcript + " ";
        }
      }
      setTranscript(finalText);
    };

    recognitionRef.current = recognition;
  }, []);

  const startRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setRecording(true);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setRecording(false);
    }
  };

  const sendAnswer = () => {
    if (!input) return;
    setMessages([...messages, { sender: "user", text: input }]);
    setInput("");
  };

  return (
    <div className="flex h-screen">
      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        <video ref={videoRef} autoPlay muted className="w-full h-auto rounded" />
        <div className="mt-4">
          <button
            onClick={recording ? stopRecording : startRecording}
            className={`px-4 py-2 rounded ${recording ? "bg-red-500" : "bg-blue-500"} text-white`}
          >
            {recording ? "Stop Recording" : "Start Recording"}
          </button>
          <p className="mt-2">{transcript}</p>
        </div>
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-xl p-4 rounded ${
              msg.sender === "ai"
                ? "bg-gray-200"
                : "bg-green-200 ml-auto"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="p-4 border-t flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-1 border p-2 rounded"
          placeholder="Type your answer..."
        />
        <button
          onClick={sendAnswer}
          className="bg-green-600 text-white px-4 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export function FeedbackPage() {
  const [feedback, setFeedback] = useState<any>(null);

  useEffect(() => {
    // fetch feedback from backend
  }, []);

  if (!feedback) return <p>Loading...</p>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Interview Feedback</h1>
      <pre className="bg-gray-100 p-4 rounded mt-4">
        {JSON.stringify(feedback, null, 2)}
      </pre>
    </div>
  );
}
