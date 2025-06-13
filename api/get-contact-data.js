export default async function handler(req, res) {
  const { cid } = req.query;

  if (!cid) {
    return res.status(400).json({ error: "Missing cid parameter" });
  }

  const apiKey = process.env.GHL_API_KEY;

  try {
    const contactRes = await fetch(`https://rest.gohighlevel.com/v1/contacts/${cid}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    const contactData = await contactRes.json();

    if (!contactData || !contactData.contact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    const contact = contactData.contact;
    const custom = contact.customField || {};

    const fields = {
      postal_code: contact.postalCode || null,  // ← native field
      home_value: custom["bNU0waZidqeaWiYpSILh"] || null,
      home_value_low: custom["iQWj6eeDvPAuvOBAkbyg"] || null,
      home_value_high: custom["JretxiJEjHR9HZioQbvb"] || null,
      average_dom: custom["KOrDhDJD63JiRoBUAiBu"] || null,
      prev_month_avg_price: custom["dqiHEziP9xhlzZb1VLwq"] || null,
      avg_price_per_sqft: custom["cTXVPZg4rXPFxnEsRRxp"] || null,
      avg_price: custom["pYO56WbZmndS2XASlPbY"] || null,
      median_price: custom["j0UHOHjtfE1GDhOw68IF"] || null,
      max_price: custom["NvueajVMVjfQeE0uKw3v"] || null,
      low_price: custom["eVirPTw6YipIKJiGEBCz"] || null,
    };

    return res.status(200).json(fields);
  } catch (err) {
    console.error("🔥 API Fetch Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
