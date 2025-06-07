export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const cid = req.query.cid;
  if (!cid) {
    return res.status(400).json({ error: "Missing contact ID" });
  }

  try {
    // Get contact data from GoHighLevel
    const ghlResponse = await fetch(`https://rest.gohighlevel.com/v1/contacts/${cid}`, {
      headers: {
        Authorization: `Bearer ${process.env.GHL_API_KEY}`,
      },
    });

    const { contact } = await ghlResponse.json();
    const fullAddress = contact?.address1 + ', ' + contact?.city + ', ' + contact?.state + ' ' + contact?.postalCode;

    if (!fullAddress) {
      return res.status(400).json({ error: "Address not found" });
    }

    // Fetch RentCast market stats
    const rentcastResponse = await fetch(`https://api.rentcast.io/v1/market/stats?address=${encodeURIComponent(fullAddress)}&range=12mo`, {
      headers: {
        'X-API-Key': '9a31cf2ab0a041059387cdd09bd0d9b1',
      },
    });

    const marketData = await rentcastResponse.json();

    return res.status(200).json({
      address: fullAddress,
      data: marketData,
    });

  } catch (err) {
    console.error("❌ Error fetching data:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
