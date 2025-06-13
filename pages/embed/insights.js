export default function handler(req, res) {
  const chart = req.query.chart || "";
  const rawTitle = req.query.title || "Market Trends";

  const decodedTitle = decodeURIComponent(rawTitle);
  const cleanTitle = decodedTitle.replace(/[^\w\s\-()]/g, "");

  res.setHeader("Content-Type", "text/html");

  res.end(`<!DOCTYPE html>
<html>
<head>
  <title>${cleanTitle}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body {
      font-family: 'Segoe UI', sans-serif;
      background: #f9f9f9;
      padding: 24px;
      margin: 0;
    }
    .container {
      max-width: 600px;
      margin: auto;
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
      padding: 20px;
    }
    canvas {
      max-width: 100%;
      height: auto !important;
    }
    h2 {
      text-align: center;
      color: #2c3e50;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>${cleanTitle}</h2>
    <canvas id="chart" height="200"></canvas>
    <script>
      const dataPoints = "${chart}".split(",").map(x => parseFloat(x.trim())).filter(n => !isNaN(n));
      const labels = Array.from({ length: 12 }).map((_, i) => {
        const d = new Date(); d.setMonth(d.getMonth() - (11 - i));
        return d.toLocaleString('default', { month: 'short' });
      });

      if (dataPoints.length === 12) {
        new Chart(document.getElementById('chart').getContext('2d'), {
          type: 'line',
          data: {
            labels,
            datasets: [{
              label: 'Avg Monthly Price',
              data: dataPoints,
              borderColor: '#3498db',
              backgroundColor: 'transparent',
              tension: 0.3
            }]
          },
          options: {
            responsive: true,
            plugins: { legend: { display: true, position: "bottom" } },
            scales: { y: { beginAtZero: false } }
          }
        });
      } else {
        document.body.innerHTML += "<p style='color:red;'>❌ Invalid chart data.</p>";
      }
    </script>
  </div>
</body>
</html>`);
}
