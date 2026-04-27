'use strict';

/**
 * /api/users  +  /api/users/login
 *
 * Vulnerable packages exercised here:
 *   jsonwebtoken 8.5.1 — CVE-2022-23529 (RCE via malicious secret object)
 *
 * Fix: upgrade jsonwebtoken to 9.0.0 in package.json — no code change needed.
 * The library's own verify() adds secret-type validation in 9.0.0.
 */

const express = require('express');
const jwt     = require('jsonwebtoken');   // CVE-2022-23529

const User            = require('../models/user');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const JWT_SECRET  = process.env.JWT_SECRET || 'demo-secret-not-for-production';
const JWT_EXPIRES = '1h';

// POST /api/users/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password required' });
  }

  const user = User.findByUsername(username);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const bcrypt = require('bcryptjs');
  if (!bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // jsonwebtoken 8.5.1 — CVE-2022-23529:
  // If the secret were attacker-controlled (e.g. pulled from an untrusted config),
  // passing a crafted object instead of a string allows RCE via path traversal
  // in the secret handler. Fix: upgrade to 9.0.0 which validates secret type.
  const token = jwt.sign(
    { sub: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );

  const { passwordHash, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

// GET /api/users
router.get('/', authenticate, (req, res) => {
  res.json({ users: User.findAll() });
});

// GET /api/users/:id
router.get('/:id', authenticate, (req, res) => {
  const user = User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// POST /api/users
router.post('/', authenticate, (req, res) => {
  const { username, email, password, role } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'username, email and password required' });
  }
  const user = User.create({ username, email, password, role });
  res.status(201).json(user);
});

module.exports = router;
