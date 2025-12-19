export function buildPrompt(resume, jd) {
  return `
You are an expert hiring manager and resume evaluator.

Compare the RESUME against the JOB DESCRIPTION.

Return ONLY valid JSON:

{
  "overallScore": number,
  "scores": {
    "skills": number,
    "experience": number,
    "impact": number,
    "roleFit": number
  },
  "strengths": [string],
  "gaps": [string],
  "improvements": [string],
  "rewrites": [
    {
      "original": string,
      "improved": string
    }
  ]
}

RESUME:
"""${resume}"""

JOB DESCRIPTION:
"""${jd}"""
`;
}
