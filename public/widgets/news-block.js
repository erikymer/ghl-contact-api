async function loadNews() {
  const params = new URLSearchParams(window.location.search);
  const zip = params.get("zip") || "08052";
  const state = params.get("state") || "NJ";

  const loadingMessage = document.getElementById("loading-message");
  const newsContainer = document.getElementById("news-headlines");

  try {
    const res = await fetch(`https://ghl-contact-api.vercel.app/api/real-estate-news?zip=${zip}&state=${state}`);
    const data = await res.json();

    if (loadingMessage) loadingMessage.style.display = "none";

    if (!data.success || !data.headlines || data.headlines.length === 0) {
      newsContainer.innerHTML = `<p>⚠️ No headlines available right now. Check back later.</p>`;
      return;
    }

    data.headlines.forEach(item => {
      const link = document.createElement("a");
      link.href = item.url;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = `📰 ${item.title} (${item.source})`;
      newsContainer.appendChild(link);
    });
  } catch (err) {
    console.error("❌ Error loading news:", err);
    if (loadingMessage) loadingMessage.style.display = "none";
    newsContainer.innerHTML = `<p>⚠️ Failed to load news. Please try again later.</p>`;
  }
}

document.addEventListener("DOMContentLoaded", loadNews);
