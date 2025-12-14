"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const BACKEND = "https://interview-gpt-backend-00vj.onrender.com";

export default function InterviewPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<{role:string,text:string}[]>([]);
  const [input, setInput] = useState("");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const setup = localStorage.getItem("setup");
    if (!setup) {
      router.replace("/");
      return;
    }

    fetch(`${BACKEND}/interview/start`, { method: "POST" })
      .then(r => r.json())
      .then(d => {
        setMessages([{ role: "Coach", text: d.question }]);
        speak(d.question);
      });
  }, []);

  function speak(text: string) {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    speechSynthesis.speak(u);
  }

  function startMic() {
    const SR = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SR();
    rec.continuous = true;
    rec.lang = "en-US";
    rec.onresult = (e:any) => {
      setInput(prev => prev + " " + e.results[e.results.length-1][0].transcript);
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
    const answer = input;
    setInput("");

    const res = await fetch(`${BACKEND}/interview/next`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answer })
    });

    const data = await res.json();
    if (data.done) {
      localStorage.setItem("interviewDone", "1");
      router.push("/feedback");
    } else {
      setMessages(m => [...m, { role: "Coach", text: data.question }]);
      speak(data.question);
    }
  }

  return (
    <div style={{ padding: 30 }}>
      <h2>Interview</h2>

      {messages.map((m, i) => (
        <p key={i}><b>{m.role}:</b> {m.text}</p>
      ))}

      <textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        rows={4}
        style={{ width: "100%" }}
      />

      <br />
      <button onClick={startMic}>🎤 Start</button>
      <button onClick={stopMic}>⛔ Stop</button>
      <button onClick={submit}>Submit</button>
    </div>
  );
}
