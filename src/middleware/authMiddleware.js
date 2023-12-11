
const jwt = require('jsonwebtoken');
const { secretKey } = require('../config/config');

function authenticate(req, res, next) {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized - No token provided' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized - Invalid token' });
  }
}

function verifyToken(token) {
  return jwt.verify(token, secretKey);
}

module.exports = {
  authenticate,
};
