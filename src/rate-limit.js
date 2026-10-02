'use strict';
// Pembatas sederhana per IP untuk satu proses Node. Gunakan shared store bila multi-instance.
module.exports = function registerLimit({ limit = 10, windowMs = 15 * 60 * 1000 } = {}) {
  const hits = new Map();
  return (req, res, next) => {
    const now = Date.now();
    for (const [key, value] of hits) if (value.until <= now) hits.delete(key);
    const key = req.ip;
    let value = hits.get(key);
    if (!value) {
      if (hits.size >= 10000) return res.status(503).json({ success: false, message: 'Layanan sedang sibuk. Coba kembali nanti.' });
      value = { count: 0, until: now + windowMs }; hits.set(key, value);
    }
    if (++value.count > limit) {
      res.set('Retry-After', String(Math.ceil((value.until - now) / 1000)));
      return res.status(429).json({ success: false, message: 'Terlalu banyak percobaan. Coba kembali dalam 15 menit.' });
    }
    next();
  };
};
