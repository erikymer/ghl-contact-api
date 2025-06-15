export default async function handler(req, res) {
  console.log("🛠️ START: real-estate-news.js called");

  const GNEWS_API_KEY = process.env.GNEWS_API_KEY;
  const { state } = req.query;

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

    // 👉 Fetch state-specific news from GNews
    let stateNews = [];

    try {
      const gnewsRes = await fetch(
        `https://gnews.io/api/v4/search?q=real+estate+${encodeURIComponent(
          state
        )}&lang=en&country=us&token=${GNEWS_API_KEY}`
      );
      const gnewsJson = await gnewsRes.json();
      console.log("📰 GNews response:", gnewsJson);

      stateNews = (gnewsJson.articles || []).slice(0, 2).map((article) => ({
        title: article.title,
        url: article.url,
      }));
    } catch (err) {
      console.warn("⚠️ Failed to fetch GNews:", err.message);
    }

    if (!stateNews || stateNews.length === 0) {
      console.log(`ℹ️ No state news for "${state}", adding fallback message`);
      stateNews = [
        {
          title: `No recent news found for ${state}`,
          url: "https://www.nar.realtor/newsroom",
        },
      ];
    }

    // 🌎 National RSS feeds with timeout + parallel fetching
    const nationalFeeds = [
      { name: "Redfin", url: "https://www.redfin.com/news/feed/" },
      { name: "Zillow", url: "https://www.zillow.com/research/feed/" },
      { name: "Realtor", url: "https://www.realtor.com/news/feed/" },
      { name: "NAR", url: "https://www.nar.realtor/newsroom/rss.xml" },
    ];

    const timeoutFetch = (url, timeoutMs = 5000) =>
      Promise.race([
        parser.parseURL(url),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), timeoutMs)
        ),
      ]);

    const nationalNewsResults = await Promise.allSettled(
      nationalFeeds.map(async (feed) => {
        try {
          const parsed = await timeoutFetch(feed.url, 5000);
          return {
            name: feed.name,
            title: parsed.items?.[0]?.title || "No title found",
            url: parsed.items?.[0]?.link || feed.url,
          };
        } catch (err) {
          console.warn(`⚠️ ${feed.name} feed failed:`, err.message);
          return {
            name: feed.name,
            title: `⚠️ Failed to load ${feed.name} feed`,
            url: feed.url,
          };
        }
      })
    );

    const nationalNews = nationalNewsResults.map((r) =>
      r.status === "fulfilled"
        ? { title: r.value.title, url: r.value.url }
        : {
            title: "⚠️ Feed load failed",
            url: "https://www.nar.realtor/newsroom",
          }
    );

    console.log("✅ Sending news response");
    res.status(200).json({ stateNews, nationalNews });
  } catch (err) {
    console.error("🔥 Fatal error:", err);
    res
      .status(500)
      .json({ error: "Server crashed while building news feed" });
  }
}
