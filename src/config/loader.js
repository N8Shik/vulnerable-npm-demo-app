'use strict';

/**
 * config/loader.js
 *
 * Vulnerable packages:
 *   json5    2.2.0 — CVE-2022-46175 (prototype pollution via JSON5.parse)
 *   minimist 1.2.5 — CVE-2021-44906 (prototype pollution via __proto__ in CLI args)
 *
 * Fix: bump json5 → 2.2.2, minimist → 1.2.6 in package.json + overrides.
 * No application code changes needed.
 */

const JSON5    = require('json5');    // CVE-2022-46175
const minimist = require('minimist'); // CVE-2021-44906
const path     = require('path');
const fs       = require('fs');

/**
 * loadConfig
 * Loads a JSON5 config file (supports comments, trailing commas, etc.)
 *
 * VULNERABLE: json5 2.2.0 — CVE-2022-46175
 * JSON5.parse() with a crafted string containing __proto__ pollutes Object.prototype.
 * Fix: upgrade to 2.2.2 where the parser guards against prototype keys.
 */
function loadConfig(configPath) {
  const fullPath = path.resolve(configPath);
  if (!fs.existsSync(fullPath)) {
    return getDefaultConfig();
  }
  try {
    const raw = fs.readFileSync(fullPath, 'utf8');
    return JSON5.parse(raw);
  } catch {
    return getDefaultConfig();
  }
}

/**
 * parseArgs
 * Parses command-line arguments.
 *
 * VULNERABLE: minimist 1.2.5 — CVE-2021-44906
 * Passing --__proto__[polluted]=true pollutes Object.prototype because
 * minimist does not sanitise property names before assignment.
 * Fix: upgrade minimist to 1.2.6 which adds prototype key filtering.
 */
function parseArgs(argv) {
  return minimist(argv || process.argv.slice(2));
}

function getDefaultConfig() {
  return {
    port:     process.env.PORT     || 3000,
    logLevel: process.env.LOG_LEVEL || 'info',
    jwtExpiry: '1h',
  };
}

module.exports = { loadConfig, parseArgs, getDefaultConfig };
