export default async function handler(req, res) {
  // ✅ Allow cross-origin requests (CORS fix for GHL)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { cid } = req.query;

  if (!cid) {
    return res.status(400).json({ success: false, message: "Missing cid parameter" });
  }

  try {
    const apiKey = process.env.GHL_API_KEY; // Set this in Vercel Environment Variables
    const baseUrl = "https://rest.gohighlevel.com/v1/contacts";
    const url = `${baseUrl}/${cid}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch contact: ${response.statusText}`);
    }

    const data = await response.json();
    const contact = data.contact;
    const customFieldData = contact.customField;

    const getFieldValue = (fieldMap, id) => {
      const field = fieldMap.find(f => f.id === id);
      return field ? field.value : null;
    };

    res.status(200).json({
      success: true,
      home_value: getFieldValue(customFieldData, "bNU0waZidqeaWiYpSILh"),
      home_value_low: getFieldValue(customFieldData, "iQWj6eeDvPAuvOBAkbyg"),
      home_value_high: getFieldValue(customFieldData, "JretxiJEjHR9HZioQbvb"),
      average_dom: getFieldValue(customFieldData, "KOrDhDJD63JiRoBUAiBu"),
      prev_month_avg_price: getFieldValue(customFieldData, "dqiHEziP9xhlzZb1VLwq"),
      avg_price_per_sqft: getFieldValue(customFieldData, "cTXVPZg4rXPFxnEsRRxp"),
      avg_price: getFieldValue(customFieldData, "pYO56WbZmndS2XASlPbY"),
      median_price: getFieldValue(customFieldData, "j0UHOHjtfE1GDhOw68IF"),
      max_price: getFieldValue(customFieldData, "NvueajVMVjfQeE0uKw3v"),
      low_price: getFieldValue(customFieldData, "eVirPTw6YipIKJiGEBCz"),
      ["12_month_avg_price"]: getFieldValue(customFieldData, "D3Uygu76qyPVXewGQgsP"),
      address: contact.address1 || ""
    });

  } catch (err) {
    console.error("API Error:", err);
    res.status(500).json({ success: false, message: "Internal server error", error: err.message });
  }
}
