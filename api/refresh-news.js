// /api/refresh-news.js

import fetch from 'node-fetch';

export default async function handler(req, res) {
  const zipStates = [
    { zip: '08052', state: 'NJ' },
    { zip: '19103', state: 'PA' },
    { zip: '08540', state: 'NJ' },
    { zip: '19067', state: 'PA' },
    { zip: '07030', state: 'NJ' },
    { zip: '19107', state: 'PA' },
    { zip: '07302', state: 'NJ' },
    { zip: '19010', state: 'PA' },
  ];

  const baseUrl = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/api/real-estate-news`;
  const results = [];

  for (const { zip, state } of zipStates) {
    try {
      const url = `${baseUrl}?zip=${zip}&state=${state}&refresh=1`;
      const response = await fetch(url);
      const json = await response.json();
      results.push({ zip, state, status: '✅', headlines: (json.stateNews?.length || 0) + (json.nationalNews?.length || 0) });
    } catch (e) {
      results.push({ zip, state, status: '❌', error: e.message });
    }
  }

  return res.status(200).json({ refreshed: results });
}
