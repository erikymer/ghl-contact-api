export async function getServerSideProps({ query, res }) {
  const chart = query.chart || "";
  const rawTitle = query.title || "Market Trends";
  const cleanTitle = decodeURIComponent(rawTitle).replace(/[^\w\s-]/g, "");
  
  res.setHeader("Content-Type", "text/html");
  
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>${cleanTitle}</title>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body { font-family: Segoe UI, sans-serif; padding:24px; background:#f9f9f9; }
    canvas { width:100% !important; height:auto !important; max-width:600px; }
  </style>
</head>
<body>
  <h2>${cleanTitle}</h2>
  <canvas id="chart" height="300"></canvas>
  <script>
    const dataPoints = "${chart}"
      .split(",")
      .map(x => parseFloat(x.trim()))
      .filter(n => !isNaN(n));
    const labels = dataPoints.map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (dataPoints.length - 1 - i));
      return d.toLocaleString('default', { month: 'short' });
    });
    new Chart(
      document.getElementById('chart').getContext('2d'),
      {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: cleanTitle,
            data: dataPoints,
            borderColor: '#3498db',
            backgroundColor: 'transparent',
            tension: 0.3
          }]
        },
        options: {
          responsive: true,
          scales: { y: { beginAtZero: false } }
        }
      }
    );
  </script>
</body>
</html>`;
  
  res.end(html);
  return { props: {} };
}

export default function Insights() {
  return null;
}
