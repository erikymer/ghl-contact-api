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

    // Fetch news from your upgraded backend
    const newsRes = await fetch(`https://ghl-contact-api.vercel.app/api/real-estate-news?zip=${zip}&state=${state}`);
    const newsJson = await newsRes.json();
    console.log("📰 News API response:", newsJson);

    newsList.innerHTML = "";

    const { stateNews = [], nationalNews = [] } = newsJson;

    stateNews.slice(0, 2).forEach((article) => {
      const li = document.createElement("li");
      li.innerHTML = `<a href="${article.url}" target="_blank" style="color:#0077b6; text-decoration:none;">${article.title}</a>`;
      newsList.appendChild(li);
    });

    nationalNews.slice(0, 3).forEach((article) => {
      const li = document.createElement("li");
      li.innerHTML = `<a href="${article.url}" target="_blank" style="color:#6c757d; text-decoration:none;">${article.title}</a>`;
      newsList.appendChild(li);
    });

    if (stateNews.length === 0 && nationalNews.length === 0) {
      newsList.innerHTML = `<li>⚠️ No headlines available right now. Check back later.</li>`;
    }
  } catch (e) {
    console.warn("❌ Error loading news:", e);
    newsList.innerHTML = `<li>⚠️ Failed to load news. Please try again later.</li>`;
  }
});
