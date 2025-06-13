export default async function handler(req, res) {
  // ✅ Fix: Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { cid } = req.query;

  if (!cid) {
    return res.status(400).json({ error: "Missing contact ID" });
  }

  const token = process.env.GHL_API_KEY;

  try {
    const ghlRes = await fetch(`https://rest.gohighlevel.com/v1/contacts/${cid}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Version: "2021-07-28"
      }
    });

    if (!ghlRes.ok) {
      throw new Error("Failed to fetch contact data");
    }

    const { contact } = await ghlRes.json();

    const result = {
      address: contact.customField.pYO56WbZmndS2XASlPbY,              // average_price
      average_price: contact.customField.pYO56WbZmndS2XASlPbY,
      average_pricesquare_foot: contact.customField.d2uKd3q1LK3tIGxxLRhh,
      average_dom: contact.customField.KOrDhDJD63JiRoBUAiBu,
      last_sold_price: contact.customField.D7kFdzqxKUbaEDyX4nHZ,       // if available
      value: contact.customField.home_value,
      low: contact.customField.home_value_low,
      high: contact.customField.home_value_high,
      city: contact.city,
      state: contact.state,
      postal_code: contact.postalCode,
      "1br_prices_12_mo_avg": contact.customField["1br_prices_12_mo_avg"]
    };

    res.status(200).json(result);
  } catch (err) {
    console.error("API Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
