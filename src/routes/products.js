'use strict';

/**
 * /api/products
 *
 * Vulnerable packages exercised here:
 *   lodash  4.17.20 — CVE-2021-23337 (command injection via _.template)
 *                     CVE-2020-28500 (ReDoS via toNumber/trim)
 *   moment  2.29.1  — CVE-2022-24785 (path traversal via locale)
 *                     CVE-2022-31129 (ReDoS via long date strings)
 *   qs      6.10.2  — CVE-2022-24999 (prototype poisoning via query string)
 *
 * Fix for ALL: bump version in package.json — zero code changes needed.
 */

const express = require('express');
const _       = require('lodash');       // CVE-2021-23337, CVE-2020-28500
const moment  = require('moment');       // CVE-2022-24785, CVE-2022-31129
const qs      = require('qs');           // CVE-2022-24999

const Product         = require('../models/product');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/products
router.get('/', authenticate, (req, res) => {
  const products = Product.findAll();

  // lodash 4.17.20: _.map and _.sortBy are safe, but _.template on user input
  // would trigger CVE-2021-23337. Used here for non-user-input demonstration.
  const enriched = _.map(products, p => ({
    ...p,
    displayPrice: `$${_.round(p.price, 2).toFixed(2)}`,
    // moment 2.29.1 — date formatting; CVE-2022-31129 triggers on very long strings
    formattedDate: moment(p.createdAt).format('YYYY-MM-DD'),
  }));

  res.json({ count: enriched.length, products: enriched });
});

// GET /api/products/search?q=...&category=...
router.get('/search', authenticate, (req, res) => {
  // qs 6.10.2 — CVE-2022-24999: parsing the raw query string; prototype
  // poisoning possible if attacker sends __proto__[polluted]=1 in query params
  const parsed = qs.parse(req.query.raw || '');
  const query  = (req.query.q || '').toLowerCase();
  const cat    = req.query.category;

  let results = Product.findAll();

  if (query) {
    // lodash 4.17.20 — _.filter is benign here; _.template would be vulnerable
    results = _.filter(results, p =>
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query)
    );
  }

  if (cat) {
    results = results.filter(p => p.category === cat);
  }

  res.json({ count: results.length, products: results, parsed });
});

// GET /api/products/:id
router.get('/:id', authenticate, (req, res) => {
  const product = Product.findById(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// POST /api/products
router.post('/', authenticate, (req, res) => {
  const { name, description, price, category } = req.body;
  if (!name || price === undefined) {
    return res.status(400).json({ error: 'name and price are required' });
  }
  // _.pick from lodash 4.17.20 — safe usage, but lodash itself is the vulnerable dep
  const data = _.pick(req.body, ['name', 'description', 'price', 'category']);
  const product = Product.create(data);
  res.status(201).json(product);
});

// PUT /api/products/:id
router.put('/:id', authenticate, (req, res) => {
  const data    = _.pick(req.body, ['name', 'description', 'price', 'category']);
  const updated = Product.update(req.params.id, data);
  if (!updated) return res.status(404).json({ error: 'Product not found' });
  res.json(updated);
});

// DELETE /api/products/:id
router.delete('/:id', authenticate, (req, res) => {
  const deleted = Product.delete(req.params.id);
  res.json({ deleted });
});

module.exports = router;
