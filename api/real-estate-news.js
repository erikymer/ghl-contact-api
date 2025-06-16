import { NextApiRequest, NextApiResponse } from "next";
import { fetchNewsFromSources } from "@/lib/news/fetchNews";

const ADDRESS_LISTING_REGEX = /^\d+\s+[^,]+,\s+[^,]+,\s+[A-Z]{2}\s+\d{5}/;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const zip = req.query.zip as string;
  const state = req.query.state as string;

  try {
    const allNews = await fetchNewsFromSources(zip, state);

    const seenSources = new Set();
    const uniqueFiltered: any[] = [];

    for (const item of allNews) {
      const title = item?.title || "";
      const source = item?.source?.name || "";

      const isListingHeadline = ADDRESS_LISTING_REGEX.test(title);
      const isRealtorListing = source === "Realtor.com" && isListingHeadline;

      if (isRealtorListing) continue;
      if (seenSources.has(source)) continue;

      seenSources.add(source);
      uniqueFiltered.push(item);
    }

    res.status(200).json({ success: true, headlines: uniqueFiltered });
  } catch (e) {
    console.error("❌ Failed to fetch real estate news:", e);
    res.status(500).json({ success: false, error: "Unable to fetch news." });
  }
}
