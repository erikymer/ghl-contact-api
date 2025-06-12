import fetch from 'node-fetch';
import Parser from 'rss-parser';

const GNEWS_API_KEY = process.env.GNEWS_API_KEY;
const parser = new Parser();

export default async function handler(req, res) {
  const { state } = req.query;

  console.log("🛠️ START: real-estate-news.js called");
  console.log("🌐 State received:", state);
  console.log("🔑 GNEWS_API_KEY present:", !!GNEWS_API_KEY);

  if (!GNEWS_API_KEY) {
    console.error("❌ GNEWS_API_KEY is missing");
    return res.status(500).json({ error: "Missing GNEWS API key" });
  }

  try {
    const gnewsRes = await fetch(`https://gnews.io/api/v4/search?q=real+estate+${encodeURIComponent(state)}&lang=en&country=us&token=${GNEWS_API_KEY}`);
    const gnewsJson = await gnewsRes.json();

    console.log("📰 GNews response:", gnewsJson);

    const stateNews = (gnewsJson.articles || []).slice(0, 2).map(article => ({
      title: article.title,
      url: article.url
    }));

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
        console.log(`✅ Parsed ${feed.name} feed`);
        if (parsed.items.length > 0) {
          nationalNews.push({
            title: parsed.items[0].title,
            url: parsed.items[0].link
          });
        }
      } catch (e) {
        console.warn(`⚠️ Error parsing ${feed.name}:`, e.message);
      }
    }

    console.log("✅ Returning state + national news");
    res.status(200).json({ stateNews, nationalNews });

  } catch (err) {
    console.error("🔥 Fatal API error:", err);
    res.status(500).json({ error: "Something broke in real-estate-news.js" });
  }
}
