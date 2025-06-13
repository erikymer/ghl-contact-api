export default function InsightsEmbedPage() {
  return (
    <html>
      <head>
        <title>Market Insights Embed</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <style>{`
          body {
            font-family: 'Segoe UI', sans-serif;
            margin: 0;
            padding: 0;
            background: #f9f9f9;
          }
          .container {
            max-width: 700px;
            margin: 40px auto;
            background: #fff;
            padding: 24px;
            border-radius: 16px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.08);
          }
          h2 {
            text-align: center;
            color: #2c3e50;
          }
          #no-data-msg {
            color: #c0392b;
            text-align: center;
            margin-top: 12px;
            display: none;
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <h2>📈 12-Month Market Trend</h2>
          <canvas id="marketChart" height="300"></canvas>
          <p id="no-data-msg">❌ No market data available.</p>
        </div>

        <script dangerouslySetInnerHTML={{ __html: `
          const params = new URLSearchParams(window.location.search);
          const chartData = params.get("chart") || "";
          const chartRaw = decodeURIComponent(chartData);

          if (chartRaw.includes(",")) {
            const dataPoints = chartRaw.split(",").map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
            const labels = Array.from({ length: 12 }).map((_, i) => {
              const d = new Date(); d.setMonth(d.getMonth() - (11 - i));
              return d.toLocaleString('default', { month: 'short' });
            });

            const canvas = document.getElementById("marketChart");
            new Chart(canvas.getContext("2d"), {
              type: 'line',
              data: {
                labels,
                datasets: [{
                  label: "Avg Monthly Sale Price",
                  data: dataPoints,
                  borderColor: "#3498db",
                  fill: false,
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
            document.getElementById("no-data-msg").style.display = "block";
          }
        ` }} />
      </body>
    </html>
  );
}
