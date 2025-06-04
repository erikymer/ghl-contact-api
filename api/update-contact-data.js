export default async function handler(req, res) {
  const cid = req.query.cid;

  if (!cid) {
    return res.status(400).json({ error: "Missing contact ID (cid)" });
  }

  try {
    // Get the contact from GHL
    const ghlResponse = await fetch(`https://rest.gohighlevel.com/v1/contacts/${cid}`, {
      headers: {
        Authorization: `Bearer ${process.env.GHL_API_KEY}`,
      },
    });

    const { contact } = await ghlResponse.json();

    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    const fullAddress = contact.fullAddress || contact.full_address;
    if (!fullAddress) {
      return res.status(400).json({ error: "Missing full address on contact" });
    }

    // Fetch AVM data from RentCast
    const rentcastResponse = await fetch(
      `https://api.rentcast.io/v1/avm/value?address=${encodeURIComponent(fullAddress)}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.RENTCAST_API_KEY}`,
        },
      }
    );

    const rentcastData = await rentcastResponse.json();

    if (!rentcastData || !rentcastData.value) {
      return res.status(404).json({ error: "RentCast value not found" });
    }

    // Update GHL contact custom fields
    await fetch(`https://rest.gohighlevel.com/v1/contacts/${cid}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${process.env.GHL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customField: {
          home_value: rentcastData.value || null,
          home_value_low: rentcastData.low || null,
          home_value_high: rentcastData.high || null,
        },
      }),
    });

    return res.status(200).json({
      updated: true,
      full_address: fullAddress,
      rentcast: rentcastData,
    });
  } catch (error) {
    console.error("Error updating contact data:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
