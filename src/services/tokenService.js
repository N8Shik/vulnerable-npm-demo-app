'use strict';

/**
 * services/tokenService.js
 *
 * Vulnerable package:
 *   jsonwebtoken 8.5.1 — CVE-2022-23529
 *   RCE via maliciously crafted secret object passed to jwt.verify().
 *
 * Fix: upgrade jsonwebtoken to 9.0.0 in package.json — no code change needed.
 * Version 9.0.0 adds internal type validation on the secret before using it.
 */

const jwt = require('jsonwebtoken');  // CVE-2022-23529

const JWT_SECRET  = process.env.JWT_SECRET  || 'demo-secret-not-for-production';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '1h';

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

/**
 * VULNERABLE: jsonwebtoken 8.5.1 — CVE-2022-23529
 * If `secret` were attacker-controlled (e.g. sourced from an untrusted config
 * manager), a crafted object value instead of a string causes the secretOrKey
 * callback to traverse arbitrary file paths → RCE.
 * Version 9.0.0 adds: if (typeof secretOrPublicKey !== 'string' && !(secretOrPublicKey instanceof Buffer)) throw...
 * No change required in this calling code — the fix is purely in the library.
 */
function verifyToken(token, secret) {
  return jwt.verify(token, secret || JWT_SECRET);
}

function decodeToken(token) {
  return jwt.decode(token, { complete: true });
}

module.exports = { generateToken, verifyToken, decodeToken };
