export default async function handler(req, res) {
  // ✅ CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { cid } = req.query;
  if (!cid) {
    return res.status(400).json({ success: false, message: "Missing contact ID" });
  }

  try {
    const response = await fetch(`https://rest.gohighlevel.com/v1/contacts/${cid}`, {
      headers: {
        Authorization: `Bearer ${process.env.GHL_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    const contact = await response.json();

    // ✅ FIXED: Corrected the customFields mapping
    const customFields = {};
    for (const field of contact.customFields || []) {
      customFields[field.id] = field.value;
    }

    // ✅ Return structured response
    res.status(200).json({
      success: true,
      home_value: customFields["bNU0waZidqeaWiYpSILh"],
      home_value_low: customFields["iQWj6eeDvPAuvOBAkbyg"],
      home_value_high: customFields["JretxiJEjHR9HZioQbvb"],
      average_dom: customFields["KOrDhDJD63JiRoBUAiBu"],
      prev_month_avg_price: customFields["dqiHEziP9xhlzZb1VLwq"],
      avg_price_per_sqft: customFields["cTXVPZg4rXPFxnEsRRxp"],
      avg_price: customFields["pYO56WbZmndS2XASlPbY"],
      median_price: customFields["j0UHOHjtfE1GDhOw68IF"],
      max_price: customFields["NvueajVMVjfQeE0uKw3v"],
      low_price: customFields["eVirPTw6YipIKJiGEBCz"],
      last_sale_price: customFields["1749841103127"],
      "12_month_avg_price": customFields["D3Uygu76qyPVXewGQgsP"],
      address: contact.address1 || null,
      postal_code: contact.postalCode || null,
      city: contact.city || null,
      state: contact.state || null
    });

  } catch (err) {
    console.error("❌ Error fetching contact:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}
