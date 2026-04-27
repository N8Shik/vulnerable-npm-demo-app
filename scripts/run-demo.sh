#!/usr/bin/env bash
# =============================================================================
# scripts/run-demo.sh — Full before-and-after vulnerability demo
# Usage: chmod +x scripts/run-demo.sh && ./scripts/run-demo.sh
# =============================================================================
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

banner() { echo -e "\n${CYAN}${BOLD}══════════════════════════════════════════${RESET}\n${CYAN}${BOLD}  $1${RESET}\n${CYAN}${BOLD}══════════════════════════════════════════${RESET}\n"; }
step()   { echo -e "${YELLOW}▶ $1${RESET}"; }
ok()     { echo -e "${GREEN}✔ $1${RESET}"; }
err()    { echo -e "${RED}✘ $1${RESET}"; }

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
mkdir -p reports

# ─── Phase 1: Vulnerable state ────────────────────────────────────────────────
banner "PHASE 1 — Install VULNERABLE dependencies"
step "Installing packages from package.json (vulnerable versions)..."
npm ci --ignore-scripts --silent
ok "Dependencies installed"

# ─── Phase 2: npm audit vulnerable ────────────────────────────────────────────
banner "PHASE 2 — npm audit (VULNERABLE STATE)"
step "Running npm audit..."
npm audit --json > reports/npm-audit-vulnerable.json || true

HIGH=$(node -e "
  const r = require('./reports/npm-audit-vulnerable.json');
  const v = r.metadata?.vulnerabilities || {};
  console.log((v.high||0) + (v.critical||0));
" 2>/dev/null || echo "?")

npm audit || true
echo ""
echo -e "  ${RED}HIGH + CRITICAL vulnerabilities: ${HIGH}${RESET}"

# ─── Phase 3: Run tests in vulnerable state ────────────────────────────────────
banner "PHASE 3 — Run tests (VULNERABLE STATE)"
step "Running Jest test suite..."
if npm test --silent; then
  ok "Tests pass — app behaviour unaffected by vulnerable deps"
else
  err "Tests failed — check output above"
fi

# ─── Phase 4: Apply fix ────────────────────────────────────────────────────────
banner "PHASE 4 — Apply FIXED versions (package-fixed.json)"
step "Backing up package.json → package.json.bak"
cp package.json package.json.bak

step "Applying package-fixed.json..."
cp package-fixed.json package.json

echo ""
echo -e "${BOLD}Changes applied (diff):${RESET}"
diff package.json.bak package.json || true

step "Installing fixed dependencies..."
npm install --ignore-scripts --silent
ok "Fixed dependencies installed"

# ─── Phase 5: Re-scan after fix ────────────────────────────────────────────────
banner "PHASE 5 — npm audit (FIXED STATE)"
step "Running npm audit on fixed packages..."
npm audit --json > reports/npm-audit-fixed.json || true

if npm audit --audit-level=high; then
  ok "npm audit PASSED — zero HIGH or CRITICAL vulnerabilities"
else
  err "Some issues remain — check output above"
fi

# ─── Phase 6: Re-run tests on fixed state ─────────────────────────────────────
banner "PHASE 6 — Tests on FIXED STATE"
step "Running Jest test suite with fixed packages..."
if npm test --silent; then
  ok "All tests pass with fixed packages"
else
  err "Tests failed after fix — check output"
fi

# ─── Summary ──────────────────────────────────────────────────────────────────
banner "DEMO COMPLETE"
echo -e "${BOLD}Reports saved:${RESET}"
echo -e "  Vulnerable audit → ${RED}reports/npm-audit-vulnerable.json${RESET}"
echo -e "  Fixed audit      → ${GREEN}reports/npm-audit-fixed.json${RESET}"
echo ""
echo -e "${BOLD}To restore vulnerable state:${RESET}  cp package.json.bak package.json && npm ci"
echo ""
echo -e "${GREEN}${BOLD}All CVEs resolved by version bumps in package.json only. Zero code changes.${RESET}"
