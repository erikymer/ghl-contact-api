export default async function handler(req, res) {
  // ✅ Fix: Enable CORS for GHL
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

    const result = {
      address: contact.address1,
      city: contact.city,
      state: contact.state,
      postal_code: contact.postalCode,
      value: contact.home_value,
      low: contact.home_value_low,
      high: contact.home_value_high,
      last_sold_price: contact.customField.D7kFdzqxKUbaEDyX4nHZ,
      average_price: contact.customField.pYO56WbZmndS2XASlPbY,
      average_pricesquare_foot: contact.customField.d2uKd3q1LK3tIGxxLRhh,
      average_dom: contact.customField.KOrDhDJD63JiRoBUAiBu,
      "1br_prices_12_mo_avg": contact.customField["1br_prices_12_mo_avg"]
    };

    res.status(200).json(result);
  } catch (err) {
    console.error("🔥 API Crash:", err);
    res.status(500).json({ error: "Server error fetching contact data", detail: err.message });
  }
}
