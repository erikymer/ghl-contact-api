// 🔧 Updated real-estate-news.js with GNews filtering and source tagging

export default async function handler(req, res) {
  const GNEWS_API_KEY = process.env.GNEWS_API_KEY;
  const { state } = req.query;

  if (!GNEWS_API_KEY || !state) {
    return res.status(400).json({ error: "Missing required params or API key" });
  }

  try {
    const fetch = (await import("node-fetch")).default;
    const Parser = (await import("rss-parser")).default;
    const parser = new Parser();

    // Real estate–focused keywords
    const realEstateKeywords = [
      "real estate", "housing", "home", "condo", "mortgage",
      "apartment", "property", "zillow", "redfin", "realtor",
      "foreclosure", "rental", "rent", "price", "market"
    ];

    const filterRelevant = (title) => {
      const lower = title.toLowerCase();
      return realEstateKeywords.some((k) => lower.includes(k));
    };

    // 📍 GNews State Headlines (with filtering)
    let stateNews = [];
    try {
      const gnewsRes = await fetch(
        `https://gnews.io/api/v4/search?q=real+estate+${encodeURIComponent(state)}&lang=en&country=us&token=${GNEWS_API_KEY}`
      );
      const gnewsJson = await gnewsRes.json();

      stateNews = (gnewsJson.articles || [])
        .filter((a) => filterRelevant(a.title))
        .slice(0, 3)
        .map((a) => ({ title: a.title, url: a.url, source: "GNews" }));
    } catch (err) {
      console.warn("⚠️ Failed to fetch GNews:", err.message);
    }

    if (stateNews.length === 0) {
      stateNews.push({
        title: `No recent real estate news found for ${state}`,
        url: "https://www.nar.realtor/newsroom",
        source: "Fallback"
      });
    }

    // 🌎 Trusted National RSS Feeds
    const nationalFeeds = [
      { name: "Redfin", url: "https://www.redfin.com/news/feed/", filter: true },
      { name: "Zillow", url: "https://www.zillow.com/research/feed/" },
      { name: "NAR", url: "https://www.nar.realtor/newsroom/rss.xml" },
      { name: "CoreLogic", url: "https://www.corelogic.com/intelligence/feed/" },
      { name: "NAHB", url: "https://www.nahb.org/rss/industry-news" },
      { name: "FreddieMac", url: "https://www.freddiemac.com/rss/freddie-mac-perspectives" },
      { name: "Altos", url: "https://www.altosresearch.com/blog/rss.xml" }
    ];

    const timeoutFetch = (url, timeoutMs = 6000) =>
      Promise.race([
        parser.parseURL(url),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), timeoutMs)
        )
      ]);

    const nationalNewsResults = await Promise.allSettled(
      nationalFeeds.map(async (feed) => {
        try {
          const parsed = await timeoutFetch(feed.url);
          let title = parsed.items?.[0]?.title || "No title found";
          let url = parsed.items?.[0]?.link || feed.url;

          if (feed.filter && !filterRelevant(title)) {
            throw new Error("Filtered out (Redfin: not real estate news)");
          }

          return { title, url, source: feed.name };
        } catch (err) {
          console.warn(`⚠️ ${feed.name} feed failed or irrelevant:`, err.message);
          return {
            title: `⚠️ Failed to load ${feed.name} feed`,
            url: feed.url,
            source: feed.name
          };
        }
      })
    );

const nationalNews = nationalNewsResults
  .filter(r => r.status === "fulfilled" && r.value.title && !r.value.title.startsWith("⚠️"))
  .map(r => ({
    title: r.value.title,
    url: r.value.url,
    source: r.value.name
  }));


    return res.status(200).json({ stateNews, nationalNews });
  } catch (err) {
    console.error("🔥 Server error in real-estate-news:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
