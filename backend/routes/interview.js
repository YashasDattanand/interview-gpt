const chat = document.getElementById("chat");
const answerBox = document.getElementById("answerBox");

let recognition;
let isInterviewActive = true;
let currentQuestion = "";

/* ---------- INITIAL LOAD ---------- */
window.onload = () => {
  fetchNextQuestion("start");
};

/* ---------- CHAT HELPERS ---------- */
function addMessage(role, text) {
  const div = document.createElement("div");
  div.className = role === "coach" ? "coach-msg" : "user-msg";
  div.innerText = `${role === "coach" ? "Coach" : "You"}: ${text}`;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

/* ---------- TEXT TO SPEECH (COACH AUDIO) ---------- */
function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  speechSynthesis.speak(utterance);
}

/* ---------- MIC CONTROLS (GLOBAL — FIXED) ---------- */
function startMic() {
  if (!("webkitSpeechRecognition" in window)) {
    alert("Speech Recognition not supported");
    return;
  }

  recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-US";

  recognition.onresult = (event) => {
    let transcript = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    answerBox.value = transcript;
  };

  recognition.start();
}

function stopMic() {
  if (recognition) recognition.stop();
}

/* ---------- SUBMIT ANSWER ---------- */
function submitAnswer() {
  const answer = answerBox.value.trim();
  if (!answer || !isInterviewActive) return;

  addMessage("user", answer);
  answerBox.value = "";

  fetchNextQuestion(answer);
}

/* ---------- FETCH NEXT QUESTION ---------- */
function fetchNextQuestion(answer) {
  fetch(`${BACKEND_URL}/interview-flow/next`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answer })
  })
  .then(res => res.json())
  .then(data => {
    if (data.done) {
      endInterview();
      return;
    }

    currentQuestion = data.question;
    addMessage("coach", currentQuestion);
    speak(currentQuestion);
  })
  .catch(err => {
    console.error(err);
    alert("Interview error");
  });
}

/* ---------- END INTERVIEW ---------- */
function endInterview() {
  isInterviewActive = false;
  stopMic();
  window.location.href = "/feedback.html";
}
