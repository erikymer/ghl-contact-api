async function loadNews() {
  const params = new URLSearchParams(window.location.search);
  const zip = params.get("zip") || "08052";
  const state = params.get("state") || "NJ";

  const newsContainer = document.getElementById("news-headlines");
  const loadingMessage = document.getElementById("loading-message");

  try {
    const res = await fetch(`https://ghl-contact-api.vercel.app/api/real-estate-news?zip=${zip}&state=${state}`);
    const data = await res.json();

    loadingMessage.style.display = "none";

    if (!data.success || !data.headlines || data.headlines.length === 0) {
      newsContainer.innerHTML = `<p>⚠️ No headlines available right now. Check back later.</p>`;
      return;
    }

    newsContainer.innerHTML = "";

    data.headlines.forEach(item => {
      const link = document.createElement("a");
      link.href = item.url;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = `📰 ${item.title} (${item.source})`;
      link.style.display = "block";
      link.style.marginBottom = "8px";
      newsContainer.appendChild(link);
    });
  } catch (err) {
    console.error("❌ Error loading news:", err);
    loadingMessage.style.display = "none";
    newsContainer.innerHTML = `<p>⚠️ Failed to load news. Please try again later.</p>`;
  }
}

document.addEventListener("DOMContentLoaded", loadNews);
