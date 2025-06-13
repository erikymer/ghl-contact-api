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

    // 🚨 DEBUG: Return entire customField map for inspection
    res.status(200).json({
      debug_fields: contact.customField,
      address1: contact.address1,
      city: contact.city,
      state: contact.state,
      postal_code: contact.postalCode
    });

  } catch (err) {
    console.error("❌ Error fetching contact:", err);
    res.status(500).json({ error: "Failed to fetch contact" });
  }
}
