#!/usr/bin/env node
'use strict';

/**
 * scripts/api-client.js
 *
 * CLI client for the vulnerable-npm-demo API.
 * Demonstrates CVE-affected packages in action:
 *
 *   axios       1.5.1 — CVE-2023-45857 (XSRF-TOKEN header leak)
 *   minimist    1.2.5 — CVE-2021-44906 (prototype pollution via --__proto__)
 *   jsonwebtoken 8.5.1 — CVE-2022-23529 (RCE via secret object)
 */

const axios    = require('axios');        // CVE-2023-45857
const minimist = require('minimist');     // CVE-2021-44906
const jwt      = require('jsonwebtoken'); // CVE-2022-23529

// minimist 1.2.5 — CVE-2021-44906:
// Running: node api-client.js --__proto__[polluted]=pwned
// would pollute Object.prototype in this version.
const args = minimist(process.argv.slice(2));
const BASE = args.base || 'http://localhost:3000';

const client = axios.create({ baseURL: BASE, timeout: 5000 });

async function login(username = 'admin', password = 'admin123') {
  const res = await client.post('/api/users/login', { username, password });
  console.log(`✔ Logged in as ${username}, token: ${res.data.token.slice(0, 40)}...`);
  return res.data.token;
}

async function listProducts(token) {
  const res = await client.get('/api/products', {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(`\nProducts (${res.data.count}):`);
  res.data.products.forEach(p =>
    console.log(`  [${p.id}] ${p.name.padEnd(20)} ${p.displayPrice}`)
  );
}

async function createProduct(token, name, price, category) {
  const res = await client.post(
    '/api/products',
    { name, price, category },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  console.log(`✔ Created: ${res.data.name} (id: ${res.data.id})`);
  return res.data;
}

async function getSummary(token) {
  const res = await client.get('/api/reports/summary', {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('\nSummary:', JSON.stringify(res.data, null, 2));
}

async function demoToken() {
  // jsonwebtoken 8.5.1 — CVE-2022-23529 demo: signing works, but if SECRET were
  // an attacker-controlled object rather than a string, verify() could lead to RCE.
  const token = jwt.sign({ sub: 'demo', role: 'USER' }, 'demo-secret', { expiresIn: '1h' });
  console.log(`\nDemo JWT (jsonwebtoken 8.5.1):\n  ${token}`);
  const decoded = jwt.decode(token, { complete: true });
  console.log('  Algorithm:', decoded.header.alg);
  console.log('  Payload:', JSON.stringify(decoded.payload));
}

async function run() {
  const cmd = args._[0] || 'help';

  try {
    switch (cmd) {
      case 'health': {
        const res = await client.get('/api/health');
        console.log('Health:', JSON.stringify(res.data, null, 2));
        break;
      }
      case 'list': {
        const token = await login();
        await listProducts(token);
        break;
      }
      case 'seed': {
        const token = await login();
        await createProduct(token, 'Sensor Beta',  34.99, 'sensors');
        await createProduct(token, 'Bridge X',    149.99, 'network');
        await createProduct(token, 'Controller',  299.99, 'industrial');
        await listProducts(token);
        break;
      }
      case 'summary': {
        const token = await login();
        await getSummary(token);
        break;
      }
      case 'token':
        await demoToken();
        break;
      default:
        console.log(`
Usage: node scripts/api-client.js <command> [options]

Commands:
  health    Check API health endpoint
  list      List all products
  seed      Seed additional products
  summary   Show product summary report
  token     Demo JWT generation (jsonwebtoken 8.5.1)

Options:
  --base    API base URL (default: http://localhost:3000)
        `);
    }
  } catch (err) {
    console.error('Error:', err.response?.data || err.message);
    process.exit(1);
  }
}

run();
