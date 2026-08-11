function requireApiKey(req, res, next) {
  const providedKey = req.header('x-api-key');

  if (!providedKey || providedKey !== process.env.API_KEY) {
    return res.status(401).json({ success: false, error: 'Missing or invalid API key' });
  }

  next();
}

module.exports = { requireApiKey };
