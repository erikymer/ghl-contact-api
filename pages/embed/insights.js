export default function handler(req, res) {
  const chart = req.query.chart || "";

  res.setHeader("Content-Type", "text/html");

  res.end(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Market Insights Embed</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      <style>
        body {
          font-family: 'Segoe UI', sans-serif;
          background: #f9f9f9;
          padding: 24px;
        }
        canvas {
          max-width: 100%;
        }
      </style>
    </head>
    <body>
      <h2>📈 Market Trend (12mo)</h2>
      <canvas id="chart" height="300"></canvas>
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
    </body>
    </html>
  `);
}
