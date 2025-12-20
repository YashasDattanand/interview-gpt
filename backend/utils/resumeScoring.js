export function scoreResumeJD(resume, jd) {
  const score = Math.min(
    90,
    50 + Math.floor(Math.random() * 35)
  );

  return {
    score,
    companyLookingFor: [
      "AI/ML innovation",
      "Customer-centric execution",
      "Platform vision & strategy"
    ],
    strengths: [
      "Agile roadmaps",
      "Cross-functional collaboration",
      "Data-driven decisions",
      "Execution ownership"
    ],
    weaknesses: [
      "Limited direct AI/ML exposure",
      "Platform-scale experience gap"
    ],
    opportunities: [
      "Upskilling in applied AI",
      "Leading end-to-end product bets"
    ],
    threats: [
      "Competition from domain specialists",
      "Ambiguity in undefined problem spaces"
    ],
    sectionScores: {
      strengths: 80,
      weaknesses: 45,
      opportunities: 70,
      threats: 50
    }
  };
}
