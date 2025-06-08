export default async function handler(req, res) {
  // ✅ CORS headers
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
        Authorization: `Bearer ${process.env.GHL_API_KEY}`
      }
    });

    const data = await response.json();

    if (!data || !data.contact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    const contact = data.contact;
    const customFields = contact.customField || [];

    // ✅ Replace these with your actual custom field IDs
    const homeValue = customFields.find(f => f.id === "bNU0waZidqeaWiYpSILh")?.value || null;
    const homeValueLow = customFields.find(f => f.id === "iQWj6eeDvPAuvOBAkbyg")?.value || null;
    const homeValueHigh = customFields.find(f => f.id === "JretxiJEjHR9HZioQbvb")?.value || null;

    return res.status(200).json({
      address: contact.address1 || null, // ✅ Pull address directly from API
      value: homeValue,
      low: homeValueLow,
      high: homeValueHigh
      marketstatsrc12_months_average_price: getField("marketstatsrc12_months_average_price")
    });

  } catch (error) {
    console.error("❌ Error fetching contact data:", error);
    return res.status(500).json({ error: "Failed to fetch contact data" });
  }
}
