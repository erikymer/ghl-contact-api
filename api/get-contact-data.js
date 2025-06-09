export default async function handler(req, res) {
  const { cid } = req.query;

  if (!cid) {
    return res.status(400).json({ error: "Missing contact ID" });
  }

  try {
    const response = await fetch(`https://rest.gohighlevel.com/v1/contacts/${cid}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer bd9243c9-4cf4-46ad-8224-f3c204d4e8c2`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to fetch contact" });
    }

    const { contact } = await response.json();
    const custom = contact.customField || {};

    return res.status(200).json({
      value: custom["home_value"],
      low: custom["home_value_low"],
      high: custom["home_value_high"],
      address: custom["address"],
      "1br_prices_12_mo_avg": custom["1br_prices_12_mo_avg"] || "", // ✅ This powers your graph
    });
  } catch (error) {
    console.error("API Fetch Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
