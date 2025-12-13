"use client";
import { useState } from "react";

let recognition: any;

export default function Interview() {
  const [history, setHistory] = useState("");
  const [answer, setAnswer] = useState("");
  const [question, setQuestion] = useState("Tell me about yourself.");

  const startMic = () => {
    recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.onresult = e => {
      setAnswer(prev => prev + " " + e.results[e.results.length-1][0].transcript);
    };
    recognition.start();
  };

  const stopMic = () => recognition.stop();

  const submit = async () => {
    const res = await fetch(
      process.env.NEXT_PUBLIC_BACKEND_URL + "/interview/next",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "product_manager",
          experience: "1-2",
          history,
          lastAnswer: answer
        })
      }
    );

    const data = await res.json();
    setHistory(history + "\nQ:" + question + "\nA:" + answer);
    setQuestion(data.question);
    setAnswer("");
  };

  return (
    <div>
      <h2>{question}</h2>
      <textarea value={answer} onChange={e=>setAnswer(e.target.value)} />
      <br/>
      <button onClick={startMic}>Start Speaking</button>
      <button onClick={stopMic}>Stop</button>
      <button onClick={submit}>Submit</button>
    </div>
  );
}
