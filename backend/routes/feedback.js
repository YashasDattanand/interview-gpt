window.onload = () => {
  const raw = localStorage.getItem("feedback");

  if (!raw) {
    document.getElementById("status").innerText = "No feedback data found.";
    return;
  }

  const data = JSON.parse(raw);

  document.getElementById("status").innerText = "";
  document.getElementById("content").style.display = "block";

  // Overall score
  const avg =
    Math.round(
      (data.scores.communication +
        data.scores.clarity +
        data.scores.confidence) / 3
    );

  document.getElementById("overallScore").innerText =
    `Overall Performance: ${avg}/10`;

  // Lists
  const fillList = (id, arr) => {
    const ul = document.getElementById(id);
    arr.forEach(item => {
      const li = document.createElement("li");
      li.innerText = item;
      ul.appendChild(li);
    });
  };

  fillList("strengths", data.strengths);
  fillList("weaknesses", data.weaknesses);
  fillList("improvements", data.improvements);

  // Chart
  const ctx = document.getElementById("scoreChart");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Communication", "Clarity", "Confidence"],
      datasets: [{
        label: "Score (out of 10)",
        data: [
          data.scores.communication,
          data.scores.clarity,
          data.scores.confidence
        ],
        backgroundColor: ["#38bdf8", "#22c55e", "#f59e0b"]
      }]
    },
    options: {
      scales: {
        y: {
          min: 0,
          max: 10,
          ticks: { stepSize: 1 }
        }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
};
