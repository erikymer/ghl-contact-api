export default async function handler(req, res) {
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

    res.status(200).json({
      value: contact.customField?.home_value || null,
      low: contact.customField?.home_value_low || null,
      high: contact.customField?.home_value_high || null
    });

  } catch (error) {
    console.error("Error fetching contact data:", error);
    res.status(500).json({ error: "Failed to fetch contact data" });
  }
}