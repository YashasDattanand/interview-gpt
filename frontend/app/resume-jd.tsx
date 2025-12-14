"use client";
import { useState } from "react";

const BACKEND = "https://interview-gpt-backend-00vj.onrender.com";

export default function ResumeJDPage() {
  const [out, setOut] = useState<any>(null);

  async function analyze(e:any) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const res = await fetch(`${BACKEND}/resume/analyze`, {
      method: "POST",
      body: fd
    });
    setOut(await res.json());
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Resume + JD Analyzer</h1>

      <form onSubmit={analyze}>
        <input type="file" name="resume" accept=".pdf,.txt" required />
        <input type="file" name="jd" accept=".pdf,.txt" required />
        <button type="submit">Analyze</button>
      </form>

      {out && (
        <>
          <h2>Match Score: {out.matchScore}%</h2>
          <h3>Gaps</h3>
          <ul>{out.gaps.map((g:string,i:number)=><li key={i}>{g}</li>)}</ul>
          <h3>Improvements</h3>
          <ul>{out.improvements.map((g:string,i:number)=><li key={i}>{g}</li>)}</ul>
        </>
      )}
    </div>
  );
}
