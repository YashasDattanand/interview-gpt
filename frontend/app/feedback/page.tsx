"use client";
import { useEffect, useState } from "react";

const BACKEND = "https://interview-gpt-backend-00vj.onrender.com";

export default function FeedbackPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!localStorage.getItem("interviewDone")) {
      window.location.href = "/";
      return;
    }

    fetch(`${BACKEND}/feedback`, { method: "POST" })
      .then(r => r.json())
      .then(setData);
  }, []);

  if (!data) return <p>Loading feedback…</p>;

  return (
    <div style={{ padding: 40 }}>
      <h1>Feedback</h1>
      <h2>Overall Score: {data.overallScore}/10</h2>

      <h3>Strengths</h3>
      <ul>{data.strengths.map((s:string,i:number)=><li key={i}>{s}</li>)}</ul>

      <h3>Weaknesses</h3>
      <ul>{data.weaknesses.map((w:string,i:number)=><li key={i}>{w}</li>)}</ul>

      <h3>Improvements</h3>
      <ul>{data.improvements.map((x:string,i:number)=><li key={i}>{x}</li>)}</ul>

      <p>{data.summary}</p>
    </div>
  );
}
