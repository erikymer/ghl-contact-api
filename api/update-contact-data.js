export default async function handler(req, res) {
  const cid = req.query.cid;

  if (!cid) {
    return res.status(400).json({ error: "Missing contact ID (cid)" });
  }

  try {
    // Fetch the contact record from GHL
    const contactResponse = await fetch(`https://rest.gohighlevel.com/v1/contacts/${cid}`, {
      headers: {
        Authorization: `Bearer ${process.env.GHL_API_KEY}`
      }
    });

    const contactData = await contactResponse.json();
    const contact = contactData.contact;

    if (!contact || !contact.address1 || !contact.city || !contact.state || !contact.postalCode) {
      return res.status(400).json({ error: "Incomplete address data for RentCast" });
    }

    const address = `${contact.address1}, ${contact.city}, ${contact.state} ${contact.postalCode}`;

    // Fetch property valuation from RentCast
    const rentcastResponse = await fetch(`https://api.rentcast.io/v1/avm/value?address=${encodeURIComponent(address)}`, {
      headers: {
        Authorization: `Bearer ${process.env.RENTCAST_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const rentcastData = await rentcastResponse.json();

    if (!rentcastData || !rentcastData.value) {
      return res.status(404).json({ error: "RentCast value not found" });
    }

    // Update contact record with valuation data
    await fetch(`https://rest.gohighlevel.com/v1/contacts/${cid}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${process.env.GHL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        customField: {
          home_value: rentcastData.value || null,
          home_value_low: rentcastData.low || null,
          home_value_high: rentcastData.high || null
        }
      })
    });

    res.status(200).json({
      updated: true,
      value: rentcastData.value,
      low: rentcastData.low,
      high: rentcastData.high
    });

  } catch (error) {
    console.error("❌ Error updating contact data:", error);
    res.status(500).json({ error: "Failed to update contact data" });
  }
}

