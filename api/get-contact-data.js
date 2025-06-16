const stateAbbrMap = {
  "alabama": "AL", "alaska": "AK", "arizona": "AZ", "arkansas": "AR", "california": "CA",
  "colorado": "CO", "connecticut": "CT", "delaware": "DE", "florida": "FL", "georgia": "GA",
  "hawaii": "HI", "idaho": "ID", "illinois": "IL", "indiana": "IN", "iowa": "IA",
  "kansas": "KS", "kentucky": "KY", "louisiana": "LA", "maine": "ME", "maryland": "MD",
  "massachusetts": "MA", "michigan": "MI", "minnesota": "MN", "mississippi": "MS",
  "missouri": "MO", "montana": "MT", "nebraska": "NE", "nevada": "NV", "new hampshire": "NH",
  "new jersey": "NJ", "new mexico": "NM", "new york": "NY", "north carolina": "NC",
  "north dakota": "ND", "ohio": "OH", "oklahoma": "OK", "oregon": "OR", "pennsylvania": "PA",
  "rhode island": "RI", "south carolina": "SC", "south dakota": "SD", "tennessee": "TN",
  "texas": "TX", "utah": "UT", "vermont": "VT", "virginia": "VA", "washington": "WA",
  "west virginia": "WV", "wisconsin": "WI", "wyoming": "WY"
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  const { cid } = req.query;
  if (!cid) return res.status(400).json({ success: false, message: "Missing contact ID" });

  try {
    const response = await fetch(`https://rest.gohighlevel.com/v1/contacts/${cid}`, {
      headers: {
        Authorization: `Bearer ${process.env.GHL_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    const result = await response.json();
    const contact = result.contact;

    if (!contact) {
      return res.status(404).json({ success: false, message: "Contact not found" });
    }

    const fields = {};
    if (Array.isArray(contact.customField)) {
      for (const field of contact.customField) {
        fields[field.id] = field.value;
      }
    }

    const resolvedAddress =
      contact.address1 ||
      fields["soR8l8ueNT4E1xGnx1rp"] || // fallback custom full address
      (contact.city && contact.state && contact.postalCode
        ? `${contact.city}, ${contact.state} ${contact.postalCode}`
        : null);

    const rawState = contact.state || "";
    const normalizedState = rawState.trim().toLowerCase();
    const stateAbbr = stateAbbrMap[normalizedState] || rawState.substring(0, 2).toUpperCase();

    res.status(200).json({
      success: true,
      home_value: fields["bNU0waZidqeaWiYpSILh"] || null,
      home_value_low: fields["iQWj6eeDvPAuvOBAkbyg"] || null,
      home_value_high: fields["JretxiJEjHR9HZioQbvb"] || null,
      average_dom: fields["KOrDhDJD63JiRoBUAiBu"] || null,
      prev_month_avg_price: fields["dqiHEziP9xhlzZb1VLwq"] || null,
      avg_price_per_sqft: fields["cTXVPZg4rXPFxnEsRRxp"] || null,
      avg_price: fields["pYO56WbZmndS2XASlPbY"] || null,
      median_price: fields["j0UHOHjtfE1GDhOw68IF"] || null,
      max_price: fields["NvueajVMVjfQeE0uKw3v"] || null,
      low_price: fields["eVirPTw6YipIKJiGEBCz"] || null,
      last_sale_price: fields["922ak91uLfiw7y9UvLR3"] || null,
      "12_month_avg_price": fields["D3Uygu76qyPVXewGQgsP"] || null,
      address: resolvedAddress || null,
      postal_code: contact.postalCode || null,
      city: contact.city || null,
      state: stateAbbr
    });
  } catch (err) {
    console.error("❌ Error fetching contact:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}
