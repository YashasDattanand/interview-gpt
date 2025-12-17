const API = "https://interview-gpt-backend-00vj.onrender.com";

async function loadFeedback() {
  const transcript = localStorage.getItem("transcript");

  const res = await fetch(`${API}/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcript })
  });

  const data = await res.json();

  document.getElementById("summary").innerText =
    "Overall performance analysis below";

  const ctx = document.getElementById("scoreChart");
  new Chart(ctx, {
    type: "radar",
    data: {
      labels: Object.keys(data.scores),
      datasets: [{
        label: "Scores",
        data: Object.values(data.scores),
        backgroundColor: "rgba(0,200,255,0.3)"
      }]
    }
  });

  data.strengths.forEach(s =>
    document.getElementById("strengths").innerHTML += `<li>${s}</li>`
  );
  data.weaknesses.forEach(w =>
    document.getElementById("weaknesses").innerHTML += `<li>${w}</li>`
  );
  data.improvements.forEach(i =>
    document.getElementById("improvements").innerHTML += `<li>${i}</li>`
  );
}

loadFeedback();
