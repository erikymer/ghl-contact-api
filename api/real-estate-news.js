import { NextApiRequest, NextApiResponse } from "next";
import Parser from "rss-parser";

const parser = new Parser();
const DAY_MS = 24 * 60 * 60 * 1000;

const REDFIN_FILTER_WORDS = ["newfins", "hires", "joined", "agents", "team"];
const GNEWS_FILTER_WORDS = ["menendez", "indictment", "lawsuit", "crime", "trial", "charged", "politician", "senator", "murder"];
const REALTOR_FILTER_WORDS = ["view more", "photos", "price", "listed", "updated", "home for sale", "realtor.com"];
const ADDRESS_LISTING_REGEX = /^\d+\s+[^,]+,\s+[^,]+,\s+[A-Z]{2}\s+\d{5}/;

function isRecent(entry: any) {
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

async function getFirstValidArticle(feedUrl: string, source: string) {
  try {
    const feed = await parser.parseURL(feedUrl);
    const entry = feed.items.find(item => item && item.title && isRecent(item) && isClean(item.title, source));
    return entry
      ? {
          title: entry.title,
          url: entry.link || "#",
          source,
        }
      : null;
  } catch (err) {
    console.warn(`⚠️ Skipping source: ${source}`, err?.message || err);
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { zip = "08052", state = "NJ" } = req.query;

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

    const results = await Promise.all(
      sources.map(({ url, source }) => getFirstValidArticle(url, source))
    );

    const filtered = results.filter(item => item && item.title);

    const seenSources = new Set();
    const uniqueFiltered = [];

    for (const item of filtered) {
      if (!item?.source || seenSources.has(item.source)) continue;
      seenSources.add(item.source);
      uniqueFiltered.push(item);
    }

    res.status(200).json({ success: true, headlines: uniqueFiltered });
  } catch (err) {
    console.error("❌ Top-level error in news handler:", err);
    res.status(200).json({
      success: false,
      headlines: [
        { title: "⚠️ Failed to load news due to server error.", url: "#", source: "System" }
      ]
    });
  }
}
