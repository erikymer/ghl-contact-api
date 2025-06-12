import fetch from 'node-fetch';
import Parser from 'rss-parser';

const GNEWS_API_KEY = process.env.GNEWS_API_KEY;
const parser = new Parser();

const nationalFeeds = [
  { name: "Redfin", url: "https://www.redfin.com/news/feed/" },
  { name: "Zillow", url: "https://www.zillow.com/research/feed/" },
  { name: "Realtor", url: "https://www.realtor.com/news/feed/" },
  { name: "NAR", url: "https://www.nar.realtor/newsroom/rss.xml" }
];

export default async function handler(req, res) {
  const { state } = req.query;

  try {
    const gnewsRes = await fetch(`https://gnews.io/api/v4/search?q=real+estate+${encodeURIComponent(state)}&lang=en&country=us&token=${GNEWS_API_KEY}`);
    const gnewsJson = await gnewsRes.json();

    const stateNews = (gnewsJson.articles || []).slice(0, 2).map(article => ({
      title: article.title,
      url: article.url
    }));

    const nationalNews = [];

    for (let feed of nationalFeeds) {
      try {
        const parsed = await parser.parseURL(feed.url);
        if (parsed.items.length > 0) {
          nationalNews.push({
            title: parsed.items[0].title,
            url: parsed.items[0].link
          });
        }
      } catch (e) {
        console.warn(`❌ Error parsing ${feed.name} RSS:`, e.message);
      }
    }

    res.status(200).json({ stateNews, nationalNews });
  } catch (err) {
    console.error("❌ News API Error:", err);
    res.status(500).json({ error: "Failed to fetch news" });
  }
}
