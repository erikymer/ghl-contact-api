window.addEventListener("load", async () => {
  const newsList = document.getElementById("news-list");
  if (!newsList) return;

  const cid = new URLSearchParams(window.location.search).get("cid");
  if (!cid) {
    newsList.innerHTML = `<li>❌ Missing contact ID (cid) in URL.</li>`;
    return;
  }

  try {
    // Get ZIP and state from contact
    const contactRes = await fetch(`https://ghl-contact-api.vercel.app/api/get-contact-data?cid=${cid}`);
    const contactJson = await contactRes.json();

    if (!contactJson.success) {
      newsList.innerHTML = `<li>⚠️ Unable to fetch contact info.</li>`;
      return;
    }

    const zip = contactJson.postal_code || "08052";
    const state = contactJson.state || "NJ";

    // Fetch news data from backend
    const newsRes = await fetch(`https://ghl-contact-api.vercel.app/api/real-estate-news?zip=${zip}&state=${state}`);
    const newsJson = await newsRes.json();
    console.log("📰 News API response:", newsJson);

    newsList.innerHTML = "";

    const { stateNews = [], nationalNews = [] } = newsJson;

    // Helper: render an article
    const renderItem = (article) => {
      const li = document.createElement("li");

      // Filter Redfin fluff
      if (article.source === "Redfin") {
        const exclude = ["hires", "agents", "team", "join us", "newfins"];
        if (exclude.some((word) => article.title.toLowerCase().includes(word))) return;
      }

      const sourceSpan = `<span class="source">${article.source}</span>`;
      li.innerHTML = `${sourceSpan}<a href="${article.url}" target="_blank">${article.title}</a>`;
      newsList.appendChild(li);
    };

    stateNews.slice(0, 2).forEach(renderItem);
    nationalNews.slice(0, 5).forEach(renderItem);

    if (stateNews.length === 0 && nationalNews.length === 0) {
      newsList.innerHTML = `<li>⚠️ No headlines available right now. Check back later.</li>`;
    }
  } catch (e) {
    console.warn("❌ Error loading news:", e);
    newsList.innerHTML = `<li>⚠️ Failed to load news. Please try again later.</li>`;
  }
});
