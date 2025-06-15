import fetch from 'node-fetch';
import Parser from 'rss-parser';

const parser = new Parser();
const DAY_MS = 24 * 60 * 60 * 1000;

const REDFIN_FILTER_WORDS = ['newfins', 'hires', 'joined', 'agents', 'team'];
const GNEWS_FILTER_WORDS = ['menendez', 'indictment', 'lawsuit', 'crime', 'trial', 'charged', 'politician', 'senator', 'murder'];

function isRecent(entry) {
  const pubDate = new Date(entry.pubDate || entry.isoDate);
  return (new Date() - pubDate) < 30 * DAY_MS;
}

function isClean(title, source) {
  const lower = title.toLowerCase();
  const filterList =
    source === 'Redfin' ? REDFIN_FILTER_WORDS :
    source === 'GNews' ? GNEWS_FILTER_WORDS : [];
  return !filterList.some(word => lower.includes(word));
}

async function getFirstValidArticle(feedUrl, source) {
  try {
    const feed = await parser.parseURL(feedUrl);
    const entry = feed.items.find(item => isRecent(item) && isClean(item.title, source));
    return entry ? {
      title: entry.title,
      url: entry.link,
      source
    } : null;
  } catch (e) {
    return {
      title: `⚠️ Failed to load ${source} feed`,
      url: feedUrl,
      source
    };
  }
}

export default async function handler(req, res) {
  const { zip = '08052', state = 'NJ' } = req.query;

  const gnewsUrl = `https://news.google.com/rss/search?q=${zip}+real+estate+when:30d&hl=en-US&gl=US&ceid=US:en`;

  const sources = [
    { url: gnewsUrl, source: 'GNews' },
    { url: 'https://www.redfin.com/news/feed/', source: 'Redfin' },
    { url: 'https://www.zillow.com/research/feed/', source: 'Zillow' },
    { url: 'https://www.nar.realtor/newsroom/rss.xml', source: 'NAR' },
    { url: 'https://www.corelogic.com/intelligence/feed/', source: 'CoreLogic' },
    { url: 'https://www.nahb.org/rss/industry-news', source: 'NAHB' },
    { url: 'https://www.freddiemac.com/rss/freddie-mac-perspectives', source: 'FreddieMac' },
    { url: 'https://www.altosresearch.com/blog/rss.xml', source: 'Altos' },
  ];

  const results = await Promise.all(
    sources.map(({ url, source }) => getFirstValidArticle(url, source))
  );

  const nationalNews = results.filter(item => item && item.source !== 'GNews');
  const stateNews = results.filter(item => item && item.source === 'GNews');

  res.status(200).json({ stateNews, nationalNews });
}
