export default function handler(req, res) {
  const cid = req.query.cid || null;
  res.status(200).json({ success: true, message: "API working!", cid });
}
