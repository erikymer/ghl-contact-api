export default async function handler(req, res) {
  const { cid } = req.query;

  if (!cid) {
    return res.status(400).json({ error: "Missing contact ID (cid)" });
  }

  try {
    const response = await fetch(`https://rest.gohighlevel.com/v1/contacts/${cid}`, {
      headers: {
        Authorization: `Bearer ${process.env.GHL_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch contact: ${response.statusText}`);
    }

    const data = await response.json();
    const contact = data.contact;
    const fields = contact.customField || {};

    const getField = (id) => fields[id] || null;

    res.status(200).json({
      // Standard Fields
      address1: contact.address1 || null,
      city: contact.city || null,
      state: contact.state || null,
      postal_code: contact.postalCode || null,

      // Top-level expected by HTML page
      home_value: getField("bNU0waZidqeaWiYpSILh"),
      home_value_low: getField("iQWj6eeDvPAuvOBAkbyg"),
      home_value_high: getField("JretxiJEjHR9HZioQbvb"),
      average_dom: getField("KOrDhDJD63JiRoBUAiBu"),
      prev_month_avg_price: getField("dqiHEziP9xhlzZb1VLwq"),
      avg_price_per_sqft: getField("cTXVPZg4rXPFxnEsRRxp"),
      avg_price: getField("pYO56WbZmndS2XASlPbY"),
      median_price: getField("j0UHOHjtfE1GDhOw68IF"),
      max_price: getField("NvueajVMVjfQeE0uKw3v"),
      low_price: getField("eVirPTw6YipIKJiGEBCz"),

      // Optional: 12-month trend for calculations
      "1br_prices_12_mo_avg": getField("D3Uygu76qyPVXewGQgsP"),
      last_sold_price: getField("D7kFdzqxKUbaEDyX4nHZ")
    });

  } catch (err) {
    console.error("❌ Error fetching contact:", err);
    res.status(500).json({ error: "Failed to fetch contact" });
  }
}
