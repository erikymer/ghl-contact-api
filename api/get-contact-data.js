export default async function handler(req, res) {
  // ✅ Allow CORS from all origins
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { cid } = req.query;
  if (!cid) {
    return res.status(400).json({ error: "Missing contact ID (cid)" });
  }

  const token = process.env.GHL_API_KEY;
  if (!token) {
    return res.status(500).json({ error: "Missing GHL_API_KEY in environment" });
  }

  try {
    const ghlRes = await fetch(`https://rest.gohighlevel.com/v1/contacts/${cid}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Version: "2021-07-28"
      }
    });

    if (!ghlRes.ok) {
      const errorText = await ghlRes.text();
      return res.status(ghlRes.status).json({ error: `GHL API Error: ${errorText}` });
    }

    const { contact } = await ghlRes.json();

    // 🧠 Safely extract custom fields (with fallback to empty string)
    const get = (key) => contact.customField?.[key] ?? "";

    const result = {
      address: contact.address1 ?? "",
      city: contact.city ?? "",
      state: contact.state ?? "",
      postal_code: contact.postalCode ?? "",

      value: contact.home_value ?? "",          // GHL native field
      low: contact.home_value_low ?? "",        // GHL native field
      high: contact.home_value_high ?? "",      // GHL native field

      last_sold_price: get("D7kFdzqxKUbaEDyX4nHZ"),
      average_price: get("pYO56WbZmndS2XASlPbY"),
      average_pricesquare_foot: get("d2uKd3q1LK3tIGxxLRhh"),
      average_dom: get("KOrDhDJD63JiRoBUAiBu"),
      "1br_prices_12_mo_avg": get("1br_prices_12_mo_avg")
    };

    res.status(200).json(result);
  } catch (err) {
    console.error("🔥 API Crash:", err);
    res.status(500).json({ error: "Server error fetching contact data", detail: err.message });
  }
}
