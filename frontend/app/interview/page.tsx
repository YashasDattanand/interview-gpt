"use client";

import { useEffect, useRef, useState } from "react";

const BACKEND = "https://interview-gpt-backend-00vj.onrender.com";

export default function InterviewPage() {
  const [messages, setMessages] = useState<{role:string,text:string}[]>([]);
  const [input, setInput] = useState("");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    fetch(`${BACKEND}/interview/start`, { method: "POST" })
      .then(res => res.json())
      .then(data => {
        setMessages([{ role: "Coach", text: data.question }]);
        speak(data.question);
      });
  }, []);

  function speak(text: string) {
    const u = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(u);
  }

  function startMic() {
    const SR = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SR();
    rec.continuous = true;
    rec.lang = "en-US";
    rec.onresult = (e:any) => {
      setInput(prev => prev + e.results[e.results.length - 1][0].transcript);
    };
    rec.start();
    recognitionRef.current = rec;
  }

  function stopMic() {
    recognitionRef.current?.stop();
  }

  async function submit() {
    if (!input.trim()) return;

    setMessages(m => [...m, { role: "You", text: input }]);
    setInput("");

    const res = await fetch(`${BACKEND}/interview/next`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answer: input })
    });

    const data = await res.json();

    if (data.done) {
      window.location.href = "/feedback";
    } else {
      setMessages(m => [...m, { role: "Coach", text: data.question }]);
      speak(data.question);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Mock Interview</h2>

      <div>
        {messages.map((m, i) => (
          <p key={i}><b>{m.role}:</b> {m.text}</p>
        ))}
      </div>

      <textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        rows={4}
        style={{ width: "100%" }}
      />

      <div>
        <button onClick={startMic}>🎤 Start</button>
        <button onClick={stopMic}>⛔ Stop</button>
        <button onClick={submit}>Submit</button>
      </div>
    </div>
  );
}
