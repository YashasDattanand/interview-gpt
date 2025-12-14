"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SetupPage() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [exp, setExp] = useState("");
  const [company, setCompany] = useState("");

  function start() {
    if (!role || !exp) {
      alert("Select role and experience");
      return;
    }
    localStorage.setItem("setup", JSON.stringify({ role, exp, company }));
    localStorage.removeItem("chat");
    router.push("/interview");
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>AI Interview Coach</h1>

      <select onChange={e => setRole(e.target.value)}>
        <option value="">Role</option>
        <option value="product_manager">Product Manager</option>
        <option value="tech_consultant">Tech Consultant</option>
        <option value="software_engineer">Software Engineer</option>
      </select>

      <select onChange={e => setExp(e.target.value)}>
        <option value="">Experience</option>
        <option value="0-1">0–1 yrs</option>
        <option value="1-3">1–3 yrs</option>
        <option value="3-5">3–5 yrs</option>
      </select>

      <input
        placeholder="Target company (optional)"
        onChange={e => setCompany(e.target.value)}
      />

      <br /><br />
      <button onClick={start}>Start Interview</button>
      <br /><br />
      <button onClick={() => router.push("/resume-jd")}>
        Resume + JD Analysis
      </button>
    </div>
  );
}
