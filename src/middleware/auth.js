'use strict';

/**
 * Auth middleware — verifies JWT using jsonwebtoken 8.5.1
 *
 * CVE-2022-23529: If JWT_SECRET were attacker-controlled (e.g. fetched from
 * an untrusted config store), passing an object instead of a string to
 * jwt.verify() can lead to RCE via path-traversal in secret handler.
 * Fix: upgrade jsonwebtoken to 9.0.0 — adds secret-type validation internally.
 * No application code change required.
 */

const jwt = require('jsonwebtoken');   // CVE-2022-23529

const JWT_SECRET = process.env.JWT_SECRET || 'demo-secret-not-for-production';

function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { authenticate };
