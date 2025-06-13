export default function handler(req, res) {
  const rawChart = req.query.chart || "";
  const title = (req.query.title || "12-Month Market Trend").replace(/[^a-zA-Z0-9\s\-]/g, "");

  const isValidChart = /^[\d\s.,]+$/.test(rawChart); // Allow digits, commas, dots, spaces
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
        canvas {
          max-width: 100%;
        }
        h2 {
          color: #2c3e50;
        }
      </style>
    </head>
    <body>
      <h2>📈 ${title}</h2>
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
          document.body.innerHTML += "<p style='color:red; margin-top:20px;'>❌ Invalid or missing chart data.</p>";
        }
      </script>
    </body>
    </html>
  `);
}
