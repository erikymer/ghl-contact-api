export default function InsightsPage({ query }) {
  // note: "query" is not available here—use getServerSideProps
  return null; // placeholder
}

// Use server-side rendering to grab chart & title from URL, then render full HTML response
export async function getServerSideProps({ query, res }) {
  const chart = query.chart || "";
  const rawTitle = query.title || "Market Trends";
  const decodedTitle = decodeURIComponent(rawTitle);
  const cleanTitle = decodedTitle.replace(/[^\w\s\-]/g, "");

  res.setHeader("Content-Type", "text/html");

  const html = `<!DOCTYPE html>
<html><head>
  <title>${cleanTitle}</title>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body { font-family:'Segoe UI', sans-serif; background:#f9f9f9; padding:24px }
    canvas { max-width:100%; height:auto; margin-bottom:24px }
  </style>
</head><body>
  <h2>${cleanTitle}</h2>
  <canvas id="chart"></canvas>
  <script>
    const dataPoints = "${chart}".split(",").map(x=>parseFloat(x.trim())).filter(n=>!isNaN(n));
    const labels = Array.from({ length: dataPoints.length }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (dataPoints.length - 1 - i));
      return d.toLocaleString('default',{month:'short'});
    });
    if (dataPoints.length) {
      new Chart(document.getElementById('chart').getContext('2d'), {
        type: 'line',
        data: { labels, datasets: [{ label: cleanTitle, data: dataPoints, borderColor: '#3498db', fill: false, tension: 0.3 }] },
        options: { responsive:true, scales:{ y:{ beginAtZero:false } } }
      });
    } else {
      document.body.innerHTML += "<p style='color:red;'>⚠️ No chart data.</p>";
    }
  </script>
</body></html>`;

  return {
    props: {},
    // stream raw HTML
    unstable_skipClientPage: true,
    unstable_redirect: false,
    unstable_notFound: false,
    unstable_revalidate: false,
    unstable_buildStaticPaths: false,
    unstable_rewrite: false,
    unstable_response: html
  };
}
