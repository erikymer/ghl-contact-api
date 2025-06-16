// real-estate-news.js (ESM-compatible version for Vercel)
import Parser from 'rss-parser';

const parser = new Parser();
const DAY_MS = 24 * 60 * 60 * 1000;

const REDFIN_FILTER_WORDS = ["newfins", "hires", "joined", "agents", "team"];
const GNEWS_FILTER_WORDS = ["menendez", "indictment", "lawsuit", "crime", "trial", "charged", "politician", "senator", "murder"];
const REALTOR_FILTER_WORDS = ["view more", "photos", "price", "listed", "updated", "home for sale", "realtor.com"];
const ADDRESS_LISTING_REGEX = /^\d+\s+[^,]+,\s+[^,]+,\s+[A-Z]{2}\s+\d{5}/;

function isRecent(entry) {
  const pubDate = new Date(entry.pubDate || entry.isoDate);
  return (new Date().getTime() - pubDate.getTime()) < 60 * DAY_MS;
}

function isListingFormat(title = "") {
  return ADDRESS_LISTING_REGEX.test(title);
}

function isClean(title = "", source = "") {
  const lower = title.toLowerCase();
  const filterList =
    source === "Redfin" ? REDFIN_FILTER_WORDS :
    source === "GNews" ? GNEWS_FILTER_WORDS :
    source === "Realtor.com" ? REALTOR_FILTER_WORDS : [];

  return !filterList.some(word => lower.includes(word)) && !isListingFormat(title);
}

async function getValidArticles(feedUrl, source, maxArticles = 2) {
  try {
    const feed = await parser.parseURL(feedUrl);
    if (!feed?.items?.length) return [];

    return feed.items
      .filter(item => item && item.title && isRecent(item) && isClean(item.title, source))
      .slice(0, maxArticles)
      .map(item => ({
        title: item.title,
        url: item.link || "#",
        source,
      }));
  } catch (err) {
    console.warn(`⚠️ Skipping source: ${source}`, err?.message || err);
    return [];
  }
}

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  try {
    const { cid } = req.query;

    if (!cid || typeof cid !== "string") {
      return res.status(400).json({
        success: false,
        headlines: [
          { title: "⚠️ Missing contact ID (cid).", url: "#", source: "System" }
        ]
      });
    }

    const contactResp = await fetch(`https://ghl-contact-api.vercel.app/api/get-contact-data?cid=${cid}`);
    if (!contactResp.ok) throw new Error(`Failed to fetch contact data. Status: ${contactResp.status}`);
    const contactData = await contactResp.json();

    const zip = contactData.postal_code || "08052";
    const state = contactData.state || "NJ";

    if (!zip || !state || zip.toString().length !== 5 || state.toString().length < 2) {
      return res.status(200).json({
        success: true,
        headlines: [
          { title: "⚠️ Missing location data. Unable to load news.", url: "#", source: "System" }
        ]
      });
    }

    const gnewsUrl = `https://news.google.com/rss/search?q=${zip}+real+estate+when:30d&hl=en-US&gl=US&ceid=US:en`;

    const sources = [
      { url: gnewsUrl, source: "GNews" },
      { url: "https://www.redfin.com/news/feed/", source: "Redfin" },
      { url: "https://www.zillow.com/research/feed/", source: "Zillow" },
      { url: "https://www.nar.realtor/newsroom/rss.xml", source: "NAR" },
      { url: "https://www.corelogic.com/intelligence/feed/", source: "CoreLogic" },
      { url: "https://www.nahb.org/rss/industry-news", source: "NAHB" },
      { url: "https://www.freddiemac.com/rss/freddie-mac-perspectives", source: "FreddieMac" },
      { url: "https://www.altosresearch.com/blog/rss.xml", source: "Altos" },
      { url: "https://www.realtor.com/news/rss", source: "Realtor.com" }
    ];

    const headlines = [];

    for (const src of sources) {
      const result = await getValidArticles(src.url, src.source, 3);
      if (result.length > 0) headlines.push(...result);
    }

    if (!headlines.length) {
      return res.status(200).json({
        success: false,
        headlines: [
          { title: "⚠️ No headlines available right now. Check back later.", url: "#", source: "System" }
        ]
      });
    }

    return res.status(200).json({ success: true, headlines });
  } catch (err) {
    console.error("❌ Real Estate News Error:", err);
    return res.status(500).json({
      success: false,
      headlines: [
        { title: "⚠️ Server error. Unable to load news.", url: "#", source: "System" }
      ]
    });
  }
}
