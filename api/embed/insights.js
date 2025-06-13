export default function handler(req, res) {
  const rawChart = req.query.chart || "";
  const title = (req.query.title || "12-Month Market Trend").replace(/[^a-zA-Z0-9\s\-]/g, "");
  const isValidChart = /^[\d\s.,]+$/.test(rawChart);
  const chart = isValidChart ? rawChart : "";

  res.setHeader("Content-Type", "text/html");

  res.end(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      <style>
        body {
          font-family: 'Segoe UI', sans-serif;
          background: #f9f9f9;
          padding: 24px;
          text-align: center;
        }
        .chart-container {
          max-width: 450px;
          margin: 0 auto;
        }
        canvas {
          width: 100% !important;
          height: 180px !important;
        }
        h2 {
          color: #2c3e50;
          margin-bottom: 16px;
        }
      </style>
    </head>
    <body>
      <h2>📈 ${title}</h2>
      <div class="chart-container">
        <canvas id="chart"></canvas>
      </div>
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
          document.body.innerHTML += "<p style='color:red; margin-top:20px;'>❌ Invalid or missing chart data.</p>";
        }
      </script>
    </body>
    </html>
  `);
}
