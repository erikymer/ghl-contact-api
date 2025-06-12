export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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
    const customFields = contact.customField || [];
    
    console.log("🛠 All Custom Fields:", JSON.stringify(customFields, null, 2));


    // Custom field IDs from your working config
    const homeValue     = customFields.find(f => f.id === "bNU0waZidqeaWiYpSILh")?.value || null;
    const homeValueLow  = customFields.find(f => f.id === "iQWj6eeDvPAuvOBAkbyg")?.value || null;
    const homeValueHigh = customFields.find(f => f.id === "JretxiJEjHR9HZioQbvb")?.value || null;
    const avgPrice      = customFields.find(f => f.id === "pYO56WbZmndS2XASlPbY")?.value || null;
    const ppsf          = customFields.find(f => f.id === "cTXVPZg4rXPFxnEsRRxp")?.value || null;
    const trendData     = customFields.find(f => f.id === "D3Uygu76qyPVXewGQgsP")?.value || null;
    const averageDOM    = customFields.find(f => f.id === "KOrDhDJD63JiRoBUAiBu")?.value || null;
    const lastSold      = customFields.find(f => f.id === "922ak91uLfiw7y9UvLR3");.vlaue || null;


    return res.status(200).json({
      address: contact.address1 || null,
      city: contact.city || null,
      state: contact.state || null,
      postal_code: contact.postalCode || null,
      value: homeValue,
      low: homeValueLow,
      high: homeValueHigh,
      average_price: avgPrice,
      average_pricesquare_foot: ppsf,
      average_dom: averageDOM,
      last_sold_price: lastSold, // ✅ ADD THIS LINE
      "1br_prices_12_mo_avg": trendData
      
    });   

  } catch (error) {
    console.error("❌ Error fetching contact data:", error);
    return res.status(500).json({ error: "Failed to fetch contact data" });
  }
}
