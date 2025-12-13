"use client";

import { useEffect, useState } from "react";

export default function Page() {
  const [msg, setMsg] = useState("Loading...");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/`)
      .then(res => res.text())
      .then(data => setMsg(data))
      .catch(() => setMsg("Backend not reachable"));
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1>InterviewGPT</h1>
      <p>{msg}</p>
    </main>
  );
}
