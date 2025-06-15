export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*"); // CORS for GHL

  console.log("🛠️ START: real-estate-news.js called");

  const GNEWS_API_KEY = process.env.GNEWS_API_KEY;
  const { zip, state } = req.query;

  console.log("🌐 State received:", state);
  console.log("🔑 GNEWS_API_KEY present:", !!GNEWS_API_KEY);

  if (!GNEWS_API_KEY) {
    console.error("❌ GNEWS_API_KEY is missing");
    return res.status(500).json({ error: "Missing GNEWS API key" });
  }

  try {
    const fetch = (await import("node-fetch")).default;
    const Parser = (await import("rss-parser")).default;
    const parser = new Parser();

    // ✅ Real estate-only GNews filtering
    const allowedKeywords = [
      "real estate", "home prices", "house prices",
      "housing market", "mortgage", "inventory", "real estate stats", "housing supply"
    ];

    const blockKeywords = [
      "indictment", "senator", "politician", "lawsuit",
      "murder", "crime", "trial", "charged", "menendez"
    ];

    let stateNews = [];

    try {
      const gnewsRes = await fetch(
        `https://gnews.io/api/v4/search?q=real+estate+${encodeURIComponent(state)}&lang=en&country=us&token=${GNEWS_API_KEY}`
      );
      const gnewsJson = await gnewsRes.json();
      console.log("📰 GNews response:", gnewsJson);

      stateNews = (gnewsJson.articles || [])
        .filter(article => {
          const title = article.title.toLowerCase();
          const hasAllowed = allowedKeywords.some(k => title.includes(k));
          const hasBlocked = blockKeywords.some(k => title.includes(k));
          return hasAllowed && !hasBlocked;
        })
        .slice(0, 3)
        .map(article => ({
          title: article.title,
          url: article.url,
          source: "GNews"
        }));
    } catch (err) {
      console.warn("⚠️ Failed to fetch GNews:", err.message);
    }

    // ✅ RSS national feeds
    const nationalFeeds = [
      { name: "Redfin", url: "https://www.redfin.com/news/feed/" },
      { name: "Zillow", url: "https://www.zillow.com/research/feed/" },
      { name: "Realtor", url: "https://www.realtor.com/news/feed/" },
      { name: "NAR", url: "https://www.nar.realtor/newsroom/rss.xml" },
      { name: "CoreLogic", url: "https://www.corelogic.com/intelligence/feed/" },
      { name: "NAHB", url: "https://www.nahb.org/rss/industry-news" },
      { name: "FreddieMac", url: "https://www.freddiemac.com/rss/freddie-mac-perspectives" },
      { name: "Altos", url: "https://www.altosresearch.com/blog/rss.xml" }
    ];

    const timeoutFetch = (url, timeoutMs = 5000) =>
      Promise.race([
        parser.parseURL(url),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), timeoutMs)
        )
      ]);

    const nationalNewsResults = await Promise.allSettled(
      nationalFeeds.map(async (feed) => {
        try {
          const parsed = await timeoutFetch(feed.url, 5000);
          const title = parsed.items?.[0]?.title || "";
          const link = parsed.items?.[0]?.link || "";
          if (!title || !link) throw new Error("No content");

          return {
            name: feed.name,
            title,
            url: link
          };
        } catch (err) {
          console.warn(`⚠️ ${feed.name} feed failed:`, err.message);
          return null; // Skip it entirely
        }
      })
    );

    const nationalNews = nationalNewsResults
      .filter(r => r.status === "fulfilled" && r.value && r.value.title)
      .map(r => ({
        title: r.value.title,
        url: r.value.url,
        source: r.value.name || "Unknown"
      }));

    console.log("✅ Sending news response");
    res.status(200).json({ stateNews, nationalNews });
  } catch (err) {
    console.error("🔥 Fatal error:", err);
    res.status(500).json({ error: "Server crashed while building news feed" });
  }
}
