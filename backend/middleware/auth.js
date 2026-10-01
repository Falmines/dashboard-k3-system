const jwt = require('jsonwebtoken');

module.exports = function auth(req, res, next) {
  if (String(process.env.REQUIRE_AUTH).toLowerCase() !== 'true') return next();
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ success:false, message:'Token autentikasi diperlukan' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ success:false, message:'Token tidak valid atau sudah kedaluwarsa' });
  }
};
