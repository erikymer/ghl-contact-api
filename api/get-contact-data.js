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

    res.status(200).json({
      // Basic contact info
      first_name: contact.firstName,
      last_name: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      address1: contact.address1,
      city: contact.city,
      state: contact.state,
      postal_code: contact.postalCode,

      // Market snapshot fields (custom field IDs)
      home_value: contact.customField.bNU0waZidqeaWiYpSILh || null,
      home_value_low: contact.customField.iQWj6eeDvPAuvOBAkbyg || null,
      home_value_high: contact.customField.JretxiJEjHR9HZioQbvb || null,
      average_dom: contact.customField.KOrDhDJD63JiRoBUAiBu || null,
      prev_month_avg_price: contact.customField.dqiHEziP9xhlzZb1VLwq || null,
      avg_price_per_sqft: contact.customField.cTXVPZg4rXPFxnEsRRxp || null,
      avg_price: contact.customField.pYO56WbZmndS2XASlPbY || null,
      median_price: contact.customField.j0UHOHjtfE1GDhOw68IF || null,
      max_price: contact.customField.NvueajVMVjfQeE0uKw3v || null,
      low_price: contact.customField.eVirPTw6YipIKJiGEBCz || null,
    });

  } catch (err) {
    console.error("❌ Error fetching contact:", err);
    res.status(500).json({ error: "Failed to fetch contact" });
  }
}
