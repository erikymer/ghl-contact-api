export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const cid = req.query.cid;

  if (!cid) {
    return res.status(400).json({ error: "Missing contact ID (cid)" });
  }

  try {
    const response = await fetch(`https://rest.gohighlevel.com/v1/contacts/${cid}`, {
      headers: {
        Authorization: `Bearer bd9243c9-4cf4-46ad-8224-f3c204d4e8c2`,
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();

    if (!data || !data.contact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    const contact = data.contact;
    const customFields = contact.customField || {};

    // ✅ Access custom fields by key (object lookup, not array find)
    return res.status(200).json({
      address: contact.address1 || null,
      value: customFields["bNU0waZidqeaWiYpSILh"] || null,
      low: customFields["iQWj6eeDvPAuvOBAkbyg"] || null,
      high: customFields["JretxiJEjHR9HZioQbvb"] || null,
      "1br_prices_12_mo_avg": customFields["contact.1br_prices_12_mo_avg"] || null
    });

  } catch (error) {
    console.error("❌ Error fetching contact data:", error);
    return res.status(500).json({ error: "Failed to fetch contact data" });
  }
}
