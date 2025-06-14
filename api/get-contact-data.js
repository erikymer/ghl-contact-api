export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  const { cid } = req.query;
  if (!cid) return res.status(400).json({ success: false, message: "Missing contact ID" });

  try {
    const response = await fetch(`https://rest.gohighlevel.com/v1/contacts/${cid}`, {
      headers: {
        Authorization: `Bearer ${process.env.GHL_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    const full = await response.json();
console.log("📦 FULL RESPONSE", full);
return res.status(200).json(full); // <- just return it raw for debug


    // ✅ MUST BE 'customField' (singular)
    const customFields = {};
    for (const field of contact.customField || []) {
      customFields[field.id] = field.value;
    }

    const resolvedAddress =
      contact.address1 ||
      contact.address ||
      contact.fullAddress ||
      (contact.city && contact.state && contact.postalCode
        ? `${contact.city}, ${contact.state} ${contact.postalCode}`
        : null);

    res.status(200).json({
      success: true,
      home_value: customFields["bNU0waZidqeaWiYpSILh"] || null,
      home_value_low: customFields["iQWj6eeDvPAuvOBAkbyg"] || null,
      home_value_high: customFields["JretxiJEjHR9HZioQbvb"] || null,
      average_dom: customFields["KOrDhDJD63JiRoBUAiBu"] || null,
      prev_month_avg_price: customFields["dqiHEziP9xhlzZb1VLwq"] || null,
      avg_price_per_sqft: customFields["cTXVPZg4rXPFxnEsRRxp"] || null,
      avg_price: customFields["pYO56WbZmndS2XASlPbY"] || null,
      median_price: customFields["j0UHOHjtfE1GDhOw68IF"] || null,
      max_price: customFields["NvueajVMVjfQeE0uKw3v"] || null,
      low_price: customFields["eVirPTw6YipIKJiGEBCz"] || null,
      last_sale_price: customFields["1749841103127"] || null,
      "12_month_avg_price": customFields["D3Uygu76qyPVXewGQgsP"] || null,
      address: resolvedAddress || null,
      postal_code: contact.postalCode || null,
      city: contact.city || null,
      state: contact.state || null
    });

  } catch (err) {
    console.error("❌ Error fetching contact:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}
