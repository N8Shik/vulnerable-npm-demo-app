# 🔓 vulnerable-npm-demo

> **⚠️ WARNING: Intentionally insecure. DO NOT deploy to production.**

A medium-sized Express + Node.js REST API purposefully using npm packages with
**real CVEs (2020–2023)** to demonstrate vulnerability scanning and remediation.
All fixes are **`package.json` version bumps only** — zero code changes required.

---

## 📋 At a Glance

| | Count |
|---|---|
| Direct vulnerable dependencies | 13 |
| Dev/transitive vulnerable deps | 10 |
| Total CVEs | 23 |
| 🔴 Critical | 3 |
| 🟠 High | 18 |
| 🟡 Medium | 2 |

---

## 🗂️ Project Structure

```
vulnerable-npm-demo/
├── package.json              ← Vulnerable versions (start here)
├── package-fixed.json        ← Fixed versions + overrides (apply to fix)
│
├── src/
│   ├── index.js              ← Express app entry point
│   ├── routes/
│   │   ├── products.js       ← lodash, qs, moment (CVEs)
│   │   ├── users.js          ← jsonwebtoken (CVE-2022-23529)
│   │   ├── reports.js        ← marked, xml2js, axios, node-fetch (CVEs)
│   │   └── health.js
│   ├── middleware/
│   │   ├── auth.js           ← jsonwebtoken (CVE-2022-23529)
│   │   └── logger.js         ← moment (CVE-2022-24785)
│   ├── services/
│   │   ├── httpClient.js     ← axios, follow-redirects, node-fetch (CVEs)
│   │   └── tokenService.js   ← jsonwebtoken (CVE-2022-23529)
│   ├── utils/
│   │   └── helpers.js        ← lodash, json5, tough-cookie (CVEs)
│   ├── config/
│   │   └── loader.js         ← json5, minimist (CVEs)
│   └── models/
│       ├── product.js
│       └── user.js
│
├── tests/
│   ├── api.test.js           ← Integration tests (supertest)
│   └── unit.test.js          ← Unit tests + version-pinning assertions
│
├── scripts/
│   ├── run-demo.sh           ← One-command before/after demo
│   └── api-client.js         ← CLI API client
│
└── docs/
    ├── CVE-REPORT.md         ← Full CVE table with fix versions
    └── DEMO-GUIDE.md         ← Presenter script
```

---

## 🚀 Quick Start

```bash
npm install --ignore-scripts
npm start
# API at http://localhost:3000
```

### API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | No | Health check |
| POST | `/api/users/login` | No | Login → JWT token |
| GET | `/api/products` | Bearer | List products |
| POST | `/api/products` | Bearer | Create product |
| GET | `/api/products/search?q=X` | Bearer | Search |
| GET | `/api/reports/catalogue` | Bearer | Markdown → HTML report |
| POST | `/api/reports/parse-xml` | Bearer | Parse XML feed |
| GET | `/api/reports/summary` | Bearer | Product summary |

### Default credentials: `admin / admin123`

---

## 🔍 Scan for Vulnerabilities

```bash
npm audit                         # Built-in — no install needed
npm audit --json > reports/npm-audit-vulnerable.json

npx snyk test                     # Snyk (requires account)
npx retire --path .               # Retire.js (no account needed)
```

---

## 🔧 Remediation

### Apply fixed versions (version bumps only)

```bash
cp package-fixed.json package.json
npm install --ignore-scripts
npm audit --audit-level=high      # Should pass — 0 vulnerabilities
npm test                          # All tests still pass
```

### Or use the automated demo script

```bash
chmod +x scripts/run-demo.sh
./scripts/run-demo.sh
# Runs: install vulnerable → scan → diff → apply fix → re-scan → re-test
```

---

## 🏷️ Tags

`security-demo` `cve` `vulnerable-by-design` `npm` `nodejs` `express`
`dependency-scanning` `devsecops` `prototype-pollution` `redos` `snyk`
