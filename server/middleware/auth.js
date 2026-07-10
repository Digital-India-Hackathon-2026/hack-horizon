const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'agriqueue-secret-key-2025';

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.farmer = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      req.farmer = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      // Token invalid, continue without auth
    }
  }
  next();
}

module.exports = { authMiddleware, optionalAuth, JWT_SECRET };
