window.addEventListener("load", async () => {
  const newsList = document.getElementById("news-list");
  if (!newsList) return;

  const cid = new URLSearchParams(window.location.search).get("cid");
  if (!cid) {
    newsList.innerHTML = `<li>❌ Missing contact ID (cid) in URL.</li>`;
    return;
  }

  try {
    // Fetch contact data from your API
    const contactRes = await fetch(`https://ghl-contact-api.vercel.app/api/get-contact-data?cid=${cid}`);
    const contactJson = await contactRes.json();

    if (!contactJson.success) {
      newsList.innerHTML = `<li>⚠️ Unable to fetch contact info.</li>`;
      return;
    }

    const zip = contactJson.postal_code || "08052";
    const state = contactJson.state || "NJ";

    // Fetch news from backend
    const newsRes = await fetch(`https://ghl-contact-api.vercel.app/api/real-estate-news?zip=${zip}&state=${state}`);
    const newsJson = await newsRes.json();
    console.log("📰 News API response:", newsJson);

    newsList.innerHTML = "";

    const { stateNews = [], nationalNews = [] } = newsJson;

    const renderItem = ({ title, url, source }) => {
      const li = document.createElement("li");
      li.style.marginBottom = "10px";
      li.innerHTML = `
        <span style="background:#f1f1f1; font-size:12px; padding:3px 6px; border-radius:4px; color:#555; margin-right:8px;">${source}</span>
        <a href="${url}" target="_blank" style="color:#0077b6; text-decoration:none;">${title}</a>
      `;
      newsList.appendChild(li);
    };

    stateNews.slice(0, 2).forEach(renderItem);
    nationalNews.slice(0, 3).forEach(renderItem);

    if (stateNews.length === 0 && nationalNews.length === 0) {
      newsList.innerHTML = `<li>⚠️ No headlines available right now. Check back later.</li>`;
    }
  } catch (e) {
    console.warn("❌ Error loading news:", e);
    newsList.innerHTML = `<li>⚠️ Failed to load news. Please try again later.</li>`;
  }
});
