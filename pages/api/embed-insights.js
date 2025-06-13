export default function handler(req, res) {
  const chart = req.query.chart || "";
  const rawTitle = req.query.title || "Market Trends";
  const decodedTitle = decodeURIComponent(rawTitle);
  const cleanTitle = decodedTitle.replace(/[^\w\s\-\(\)]/g, "");

  res.setHeader("Content-Type", "text/html");
  res.end(`<!DOCTYPE html>
<html>
<head>
  <title>${cleanTitle}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body { font-family: 'Segoe UI', sans-serif; background:#f9f9f9; padding:24px; }
    canvas { max-width:100%; height:auto; }
  </style>
</head>
<body>
  <h2>${cleanTitle}</h2>
  <canvas id="chart" height="300"></canvas>
  <script>
    const dataPoints = "${chart}"
      .split(",").map(x=>parseFloat(x.trim())).filter(n=>!isNaN(n));
    const labels = Array.from({ length: dataPoints.length },(_,i)=>{
      const d=new Date();
      d.setMonth(d.getMonth() - (dataPoints.length - 1 - i));
      return d.toLocaleString('default', { month:'short' });
    });
    new Chart(document.getElementById('chart').getContext('2d'), {
      type:'line',
      data: { labels, datasets:[{label:cleanTitle, data:dataPoints, borderColor:'#3498db', tension:0.3}] },
      options:{responsive:true, plugins:{legend:{display:true,position:'bottom'}}, scales:{y:{beginAtZero:false}}}
    });
  </script>
</body>
</html>`);
}
