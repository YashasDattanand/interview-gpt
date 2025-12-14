"use client";

import { useEffect, useState } from "react";
import Chart from "chart.js/auto";

const BACKEND = "https://interview-gpt-backend-00vj.onrender.com";

type Feedback = {
  overallScore: number;
  clarity: number;
  structure: number;
  relevance: number;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  summary: string;
};

export default function FeedbackPage() {
  const [data, setData] = useState<Feedback | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${BACKEND}/feedback`, { method: "POST" })
      .then(res => res.json())
      .then(json => {
        if (json.error) {
          setError(json.error);
          return;
        }
        setData(json);
        drawChart(json);
      })
      .catch(() => setError("Failed to load feedback"));
  }, []);

  function drawChart(d: Feedback) {
    const ctx = document.getElementById("scoreChart") as HTMLCanvasElement;
    if (!ctx) return;

    new Chart(ctx, {
      type: "radar",
      data: {
        labels: ["Clarity", "Structure", "Relevance"],
        datasets: [
          {
            label: "Score",
            data: [d.clarity, d.structure, d.relevance],
            backgroundColor: "rgba(99, 102, 241, 0.2)",
            borderColor: "rgb(99, 102, 241)",
            borderWidth: 2,
          },
        ],
      },
      options: {
        scales: {
          r: {
            min: 0,
            max: 10,
            ticks: { stepSize: 2 },
          },
        },
      },
    });
  }

  if (error) {
    return <p style={{ padding: 20, color: "red" }}>{error}</p>;
  }

  if (!data) {
    return <p style={{ padding: 20 }}>Loading feedback...</p>;
  }

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "auto" }}>
      <h1>Interview Feedback</h1>

      <h2>Overall Score: {data.overallScore}/10</h2>

      <canvas id="scoreChart" width="300" height="300"></canvas>

      <p style={{ marginTop: 20 }}>{data.summary}</p>

      <h3>Strengths</h3>
      <ul>
        {data.strengths.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>

      <h3>Weaknesses</h3>
      <ul>
        {data.weaknesses.map((w, i) => (
          <li key={i}>{w}</li>
        ))}
      </ul>

      <h3>Improvements</h3>
      <ul>
        {data.improvements.map((imp, i) => (
          <li key={i}>{imp}</li>
        ))}
      </ul>
    </div>
  );
}
