'use strict';

/**
 * /api/reports
 *
 * Vulnerable packages exercised here:
 *   marked      4.0.9  — CVE-2022-21680 (ReDoS via block rule regex)
 *   xml2js      0.4.23 — CVE-2023-0842  (prototype pollution via XML)
 *   axios       1.5.1  — CVE-2023-45857 (XSRF-TOKEN leak to any host)
 *   node-fetch  2.6.5  — CVE-2022-0235  (auth header forwarded on redirect)
 *   follow-redirects 1.14.9 — CVE-2023-26159 (open redirect)
 *
 * Fix: version bumps in package.json only — no application code changes.
 */

const express   = require('express');
const { marked } = require('marked');       // CVE-2022-21680
const xml2js    = require('xml2js');         // CVE-2023-0842
const axios     = require('axios');          // CVE-2023-45857
const fetch     = require('node-fetch');     // CVE-2022-0235

const { authenticate } = require('../middleware/auth');
const Product          = require('../models/product');

const router = express.Router();

// GET /api/reports/catalogue
// Returns product catalogue as Markdown-rendered HTML
// marked 4.0.9 — CVE-2022-21680: ReDoS in block-level rule regex.
// Fix: upgrade marked to 4.0.10+.
router.get('/catalogue', authenticate, (req, res) => {
  const products = Product.findAll();

  let md = `# Product Catalogue\n\n`;
  md += `| ID | Name | Category | Price |\n`;
  md += `|----|------|----------|-------|\n`;
  products.forEach(p => {
    md += `| ${p.id} | ${p.name} | ${p.category} | $${p.price} |\n`;
  });
  md += `\n_Generated at ${new Date().toISOString()}_\n`;

  // marked 4.0.9 parses this — CVE-2022-21680 triggers on adversarial input
  const html = marked(md);
  res.type('html').send(html);
});

// POST /api/reports/parse-xml
// Parses an XML product feed
// xml2js 0.4.23 — CVE-2023-0842: prototype pollution via crafted XML.
// Fix: upgrade xml2js to 0.5.0+.
router.post('/parse-xml', authenticate, async (req, res) => {
  const { xml } = req.body;
  if (!xml) return res.status(400).json({ error: 'xml body required' });

  try {
    // xml2js 0.4.23: a crafted XML payload with __proto__ key can pollute
    // Object.prototype — fixed internally in 0.5.0.
    const result = await xml2js.parseStringPromise(xml, { explicitArray: false });
    res.json({ parsed: result });
  } catch (err) {
    res.status(400).json({ error: 'XML parse error', detail: err.message });
  }
});

// GET /api/reports/external?url=...
// Fetches an external resource and summarises it
// axios 1.5.1     — CVE-2023-45857: XSRF-TOKEN leaked via X-XSRF-TOKEN header.
// node-fetch 2.6.5 — CVE-2022-0235: auth header forwarded to redirect destination.
// follow-redirects 1.14.9 — CVE-2023-26159: open redirect via malformed hostname.
// Fix for all: bump respective versions — library internals fixed upstream.
router.get('/external', authenticate, async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'url query param required' });

  try {
    // axios 1.5.1 — CVE-2023-45857: if XSRF-TOKEN cookie is present, it leaks
    // via X-XSRF-TOKEN header to ANY host, not just the same origin.
    const response = await axios.get(url, { timeout: 5000 });
    res.json({
      status:  response.status,
      headers: response.headers,
      length:  JSON.stringify(response.data).length,
    });
  } catch (err) {
    res.status(502).json({ error: 'External fetch failed', detail: err.message });
  }
});

// GET /api/reports/summary
router.get('/summary', authenticate, (req, res) => {
  const products = Product.findAll();
  const byCategory = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  res.json({
    totalProducts: products.length,
    byCategory,
    generatedAt: new Date().toISOString(),
  });
});

module.exports = router;
