import fetch from "node-fetch";

export default async function handler(req, res) {
  const { cid } = req.query;

  if (!cid) {
    return res.status(400).json({ error: "Missing contact ID (cid)" });
  }

  try {
    const ghlToken = process.env.GHL_API_KEY; // Make sure your API key is set in Vercel environment variables
    const contactRes = await fetch(`https://rest.gohighlevel.com/v1/contacts/${cid}`, {
      headers: {
        Authorization: `Bearer ${ghlToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!contactRes.ok) {
      return res.status(contactRes.status).json({ error: "Failed to fetch contact data" });
    }

    const contactData = await contactRes.json();
    const contact = contactData.contact;

    // Extract fields from custom fields
    const getField = (key) => {
      return contact.customField.find((f) => f.key === key)?.value || "";
    };

    return res.status(200).json({
      address: contact.address1 || "",
      value: getField("home_value"),
      low: getField("home_value_low"),
      high: getField("home_value_high"),
      "1br_prices_12_mo_avg": getField("1br_prices_12_mo_avg")
    });
  } catch (err) {
    console.error("API Error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
