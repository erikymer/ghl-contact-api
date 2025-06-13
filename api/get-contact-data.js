export default async function handler(req, res) {
  const { cid } = req.query;

  if (!cid) {
    return res.status(400).json({ error: 'Missing contact ID (cid)' });
  }

  try {
    const ghlRes = await fetch(`https://rest.gohighlevel.com/v1/contacts/${cid}`, {
      headers: {
        Authorization: `Bearer ${process.env.GHL_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const ghlData = await ghlRes.json();

    if (!ghlData || !ghlData.contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    const contact = ghlData.contact;

    const customFields = {};
    contact.customField && contact.customField.forEach(field => {
      customFields[field.id] = field.value;
    });

    res.status(200).json({
      address: contact.address1 || '',
      city: contact.city || '',
      state: contact.state || '',
      postal_code: contact.postalCode || '',
      value: customFields['Z9wT9yJnKfzC7V5RSgQO'] || '',
      low: customFields['nxaNNu2ynYeGC4xGyF7X'] || '',
      high: customFields['vC96tRuTv2jaBJqgiDiH'] || '',
      customField: customFields,
    });

  } catch (error) {
    console.error('API Fetch Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
