# 🎤 Live Demo Guide — vulnerable-npm-demo

Step-by-step presenter script. Total demo time: ~12 minutes.

---

## Prerequisites

```bash
node --version    # 18+
npm --version     # 8.3+ (needed for overrides feature)
git clone https://github.com/<your-org>/vulnerable-npm-demo.git
cd vulnerable-npm-demo
```

---

## Act 1 — Show the Project (2 min)

> "This is a medium-sized Express REST API — authentication, products, reports.
> Nothing unusual on the surface."

```bash
ls -1 src/
cat README.md | head -50
```

> "But let's look at what's pinned in package.json..."

```bash
cat package.json | grep -A5 '"dependencies"'
cat package.json | grep -A10 '"devDependencies"'
```

**Key talking points:**
- These look like slightly old but ordinary package versions
- The application code itself is completely fine
- Every vulnerability lives inside the package internals

---

## Act 2 — Scan the Vulnerable State (4 min)

```bash
npm ci --ignore-scripts
npm audit
```

> "The audit reports HIGH and CRITICAL CVEs. Let's look at the key ones."

**Walk through in terminal output:**

| CVE | Package | What to say |
|-----|---------|-------------|
| CVE-2023-45857 | axios 1.5.1 | "XSRF token leaked in every cross-origin request" |
| CVE-2022-23529 | jsonwebtoken 8.5.1 | "JWT verify() can lead to RCE if secret is attacker-controlled" |
| CVE-2021-44906 | minimist 1.2.5 | "CLI argument parsing pollutes Object.prototype" |
| CVE-2023-26136 | tough-cookie 4.1.2 | "Critical — cookie jar prototype pollution" |
| CVE-2022-46175 | json5 2.2.0 | "JSON config parsing pollutes prototype" |
| CVE-2021-3807 | ansi-regex 5.0.0 | "ReDoS — transitive from build tools" |

```bash
# Save the report
npm audit --json > reports/npm-audit-vulnerable.json
```

---

## Act 3 — Explain Why No Code Fix Needed (2 min)

> "Every CVE here is fixed **inside the library itself** in a newer version.
> There is nothing wrong with how our application calls these packages."

```bash
# Show the diff between vulnerable and fixed manifests
diff package.json package-fixed.json
```

> "That's it. Version numbers. No logic changes, no security patches to our
> application code, no refactoring."

**Key point — the `overrides` block:**
```bash
cat package-fixed.json | grep -A20 '"overrides"'
```

> "The overrides block forces all transitive dependencies to safe versions too —
> so even packages we didn't install directly get fixed."

---

## Act 4 — Apply Fix and Verify (3 min)

```bash
cp package-fixed.json package.json
npm install --ignore-scripts
```

```bash
npm audit --audit-level=high
# Expected: "found 0 vulnerabilities"
```

```bash
npm test
# Expected: all tests pass — behaviour unchanged
```

---

## Act 5 — One Command Demo (1 min)

```bash
# Restores vulnerable state first, then scans, fixes, re-scans
cp package.json.bak package.json && npm ci  # restore
./scripts/run-demo.sh
```

---

## CVE Quick-Reference Card

| CVE | Package | CVSS | Fix |
|-----|---------|------|-----|
| CVE-2023-26136 | tough-cookie 4.1.2 | 🔴 9.8 | → 4.1.3 |
| CVE-2021-44906 | minimist 1.2.5 | 🔴 9.8 | → 1.2.6 |
| CVE-2021-3918 | json-schema 0.2.3 | 🔴 9.8 | → 0.4.0 |
| CVE-2022-0235 | node-fetch 2.6.5 | 🟠 8.8 | → 2.6.7 |
| CVE-2022-23529 | jsonwebtoken 8.5.1 | 🟠 7.6 | → 9.0.0 |
| CVE-2022-24999 | qs 6.10.2 | 🟠 7.5 | → 6.10.3 |
| CVE-2021-23337 | lodash 4.17.20 | 🟠 7.2 | → 4.17.21 |
| CVE-2022-24785 | moment 2.29.1 | 🟠 7.5 | → 2.29.4 |
| CVE-2022-21680 | marked 4.0.9 | 🟠 7.5 | → 4.0.10 |
| CVE-2023-45857 | axios 1.5.1 | 🟠 6.5 | → 1.6.0 |
| CVE-2023-0842 | xml2js 0.4.23 | 🟠 7.5 | → 0.5.0 |

---

*Keep this file open on a second screen during the live demo.*
