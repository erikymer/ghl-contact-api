export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const { zip, state } = req.query;
  const GNEWS_API_KEY = process.env.GNEWS_API_KEY;

  if (!GNEWS_API_KEY) {
    return res.status(500).json({ error: "Missing GNEWS API key" });
  }

  try {
    const fetch = (await import("node-fetch")).default;
    const Parser = (await import("rss-parser")).default;
    const parser = new Parser();

    // 📰 State-based GNews
    let stateNews = [];
    try {
      const gnewsRes = await fetch(
        `https://gnews.io/api/v4/search?q=real+estate+${encodeURIComponent(state)}&lang=en&country=us&token=${GNEWS_API_KEY}`
      );
      const gnewsJson = await gnewsRes.json();
      stateNews = (gnewsJson.articles || []).slice(0, 2).map(article => ({
        title: article.title,
        url: article.url,
      }));
    } catch (err) {
      console.warn("⚠️ GNews fetch failed:", err.message);
    }

    if (!stateNews.length) {
      stateNews.push({
        title: `No recent local news found for ${state}`,
        url: "https://www.nar.realtor/newsroom",
      });
    }

    // 📚 National real estate sources
    const feeds = [
      { name: "Redfin", url: "https://www.redfin.com/news/feed/", filter: true },
      { name: "Zillow", url: "https://www.zillow.com/research/feed/", filter: false },
      { name: "Realtor", url: "https://www.realtor.com/news/feed/", filter: false },
      { name: "NAR", url: "https://www.nar.realtor/newsroom/rss.xml", filter: false },
      { name: "CoreLogic", url: "https://www.corelogic.com/intelligence/feed/", filter: false },
      { name: "NAHB", url: "https://www.nahb.org/rss/Blog", filter: false },
      { name: "FreddieMac", url: "https://www.freddiemac.com/research/rss", filter: false },
    ];

    const keywords = ["price", "market", "home", "rent", "sale", "inventory", "mortgage"];

    const timeoutFetch = (url, timeoutMs = 5000) =>
      Promise.race([
        parser.parseURL(url),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), timeoutMs)),
      ]);

    const nationalNewsResults = await Promise.allSettled(
      feeds.map(async (source) => {
        try {
          const parsed = await timeoutFetch(source.url, 5000);
          let items = parsed.items || [];

          // Filter Redfin only
          if (source.filter) {
            items = items.filter(item =>
              keywords.some(k => item.title?.toLowerCase().includes(k))
            );
          }

          const item = items[0];

          return {
            name: source.name,
            title: item?.title || `⚠️ No relevant articles found for ${source.name}`,
            url: item?.link || source.url,
          };
        } catch (err) {
          console.warn(`⚠️ ${source.name} feed failed:`, err.message);
          return {
            name: source.name,
            title: `⚠️ Failed to load ${source.name} feed`,
            url: feeds.find(f => f.name === source.name)?.url || "#",
          };
        }
      })
    );

    const nationalNews = nationalNewsResults
      .filter(r => r.status === "fulfilled")
      .map(r => ({
        title: r.value.title,
        url: r.value.url,
      }));

    res.status(200).json({ stateNews, nationalNews });
  } catch (err) {
    console.error("🔥 Fatal error:", err);
    res.status(500).json({ error: "Server crashed while building news feed" });
  }
}
