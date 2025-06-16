import { NextApiRequest, NextApiResponse } from "next";
import { fetchNewsFromSources } from "@/lib/news/fetchNews";

const ADDRESS_LISTING_REGEX = /^\d+\s+[^,]+,\s+[^,]+,\s+[A-Z]{2}\s+\d{5}/;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const zip = req.query.zip as string;
    const state = req.query.state as string;

    console.log("🧪 Incoming request:", { zip, state });

    // 🛑 Validate inputs
    if (!zip || !state || zip.length !== 5 || state.length < 2) {
      console.warn("⚠️ Missing or invalid ZIP/state params:", { zip, state });
      return res.status(200).json({
        success: true,
        headlines: [
          { title: "⚠️ Missing location data. Unable to load news.", url: "#", source: "System" }
        ]
      });
    }

    let allNews = [];
    try {
      allNews = await fetchNewsFromSources(zip, state);
    } catch (err) {
      console.error("❌ fetchNewsFromSources failed:", err);
      return res.status(200).json({
        success: true,
        headlines: [
          { title: "📉 Mortgage Rates Dip Again Amid Market Uncertainty", url: "#", source: "MockNews" },
          { title: "📈 Home Prices Continue Rising in Suburban Markets", url: "#", source: "MockNews2" }
        ]
      });
    }

    const seenSources = new Set();
    const uniqueFiltered: any[] = [];

    for (const item of allNews) {
      const title = item?.title || "";
      const rawSource = item?.source;
      const source = typeof rawSource === "string" ? rawSource : rawSource?.name || "";

      const isListingHeadline = ADDRESS_LISTING_REGEX.test(title);
      const isRealtorListing = source === "Realtor.com" && isListingHeadline;

      if (isRealtorListing) continue;
      if (!source || seenSources.has(source)) continue;

      seenSources.add(source);
      uniqueFiltered.push(item);
    }

    console.log("✅ Final headlines count:", uniqueFiltered.length);

    res.status(200).json({ success: true, headlines: uniqueFiltered });
  } catch (err) {
    console.error("❌ Top-level error in real-estate-news.js:", err);
    return res.status(200).json({
      success: true,
      headlines: [
        { title: "⚠️ Unable to load full news list. Please check back later.", url: "#", source: "System" }
      ]
    });
  }
}
