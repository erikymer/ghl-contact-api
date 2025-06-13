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
    const fetch = (await import('node-fetch')).default;
    const Parser = (await import('rss-parser')).default;
    const parser = new Parser();

    // 👉 Fetch state-specific news
    let stateNews = [];

    try {
      const gnewsRes = await fetch(`https://gnews.io/api/v4/search?q=real+estate+${encodeURIComponent(state)}&lang=en&country=us&token=${GNEWS_API_KEY}`);
      const gnewsJson = await gnewsRes.json();
      console.log("📰 GNews response:", gnewsJson);

      stateNews = (gnewsJson.articles || []).slice(0, 2).map(article => ({
        title: article.title,
        url: article.url
      }));
    } catch (err) {
      console.warn("⚠️ Failed to fetch GNews:", err.message);
    }

    // 🔄 Fallback if no state news found
    if (!stateNews || stateNews.length === 0) {
      console.log(`ℹ️ No state news for "${state}", adding fallback message`);
      stateNews = [{
        title: `No recent news found for ${state}`,
        url: "https://www.nar.realtor/newsroom"
      }];
    }

    // 🌎 National real estate RSS feeds
    const nationalFeeds = [
      { name: "Redfin", url: "https://www.redfin.com/news/feed/" },
      { name: "Zillow", url: "https://www.zillow.com/research/feed/" },
      { name: "Realtor", url: "https://www.realtor.com/news/feed/" },
      { name: "NAR", url: "https://www.nar.realtor/newsroom/rss.xml" }
    ];

    const nationalNews = [];

    for (const feed of nationalFeeds) {
      try {
        const parsed = await parser.parseURL(feed.url);
        console.log(`✅ ${feed.name} feed parsed:`, parsed.items?.[0]?.title);
        if (parsed.items && parsed.items.length > 0) {
          nationalNews.push({
            title: parsed.items[0].title,
            url: parsed.items[0].link
          });
        }
      } catch (e) {
        console.warn(`⚠️ Error parsing ${feed.name}:`, e.message);
        nationalNews.push({
          title: `⚠️ Failed to load ${feed.name} feed`,
          url: feed.url
        });
      }
    }

    console.log("✅ Sending news response");
    res.status(200).json({ stateNews, nationalNews });

  } catch (err) {
    console.error("🔥 Fatal error:", err);
    res.status(500).json({ error: "Server crashed while building news feed" });
  }
}
