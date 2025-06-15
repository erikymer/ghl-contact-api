window.addEventListener("load", async () => {
  const newsList = document.getElementById("news-list");
  if (!newsList) return;

  const zip = "08052";
  const stateCode = "NJ";

  try {
    const res = await fetch(`https://ghl-contact-api.vercel.app/api/real-estate-news?zip=${zip}&state=${stateCode}`);
    const json = await res.json();
    console.log("📰 News API response:", json);

    newsList.innerHTML = "";

    const { stateNews = [], nationalNews = [] } = json;

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
