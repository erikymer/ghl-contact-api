export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { cid } = req.query;
  if (!cid) return res.status(400).json({ success: false, message: "Missing cid" });

  try {
    const apiKey = process.env.GHL_API_KEY;
    const contactRes = await fetch(`https://rest.gohighlevel.com/v1/contacts/${cid}`, {
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }
    });
    if (!contactRes.ok) throw new Error(`Fetch failed: ${contactRes.statusText}`);

    const contactData = await contactRes.json();
    const customFieldData = contactData.contact.customField;

    // Build raw fields with id, label, value
    const rawFields = customFieldData.map(f => ({
      id: f.id,
      label: f.label || "",
      value: f.value
    }));

    res.status(200).json({
      success: true,
      home_value: "",
      home_value_low: "",
      home_value_high: "",
      address: "",
      raw_custom_fields: rawFields
    });
  } catch (e) {
    console.error("API error:", e);
    res.status(500).json({ success: false, error: e.message });
  }
}
