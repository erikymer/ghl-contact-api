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

// Helper to get custom field by ID
const getCustomField = (id) => {
  const field = contact.customField?.find(f => f.id === id);
  return field?.value || null;
};

res.status(200).json({
  value: getCustomField("bNU0waZidqeaWiYpSILh"),
  low: getCustomField("iQWj6eeDvPAuvOBAkbyg"),
  high: getCustomField("JretxiJEjHR9HZioQbvb")
});




  } catch (error) {
    console.error("Error fetching contact data:", error);
    res.status(500).json({ error: "Failed to fetch contact data" });
  }
}
