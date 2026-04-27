'use strict';

/**
 * services/httpClient.js
 *
 * Demonstrates the HTTP client vulnerability chain:
 *
 *   axios        1.5.1  — CVE-2023-45857 (XSRF-TOKEN leak to any host)
 *   follow-redirects 1.14.9 — CVE-2023-26159 (open redirect / info leak)
 *                             Transitive dependency of axios.
 *   node-fetch   2.6.5  — CVE-2022-0235  (Authorization header forwarded on redirect)
 *
 * Fix: bump axios → 1.6.0, node-fetch → 2.6.7, follow-redirects → 1.15.4
 *      in package.json + overrides. No application code changes.
 */

const axios  = require('axios');       // CVE-2023-45857
const fetch  = require('node-fetch');  // CVE-2022-0235

/**
 * axiosFetch
 * Fetches a URL using axios.
 *
 * VULNERABLE: axios 1.5.1 — CVE-2023-45857
 * When withCredentials is true and XSRF-TOKEN cookie is present, axios sends
 * the X-XSRF-TOKEN header to EVERY host, not just the origin — leaking the
 * CSRF token to third parties on cross-origin requests.
 *
 * Also transitively vulnerable via follow-redirects 1.14.9 — CVE-2023-26159:
 * URL hostname parsed incorrectly allowing open-redirect to attacker-controlled host.
 *
 * Fix: upgrade axios to 1.6.0 (and follow-redirects will be bumped transitively).
 */
async function axiosFetch(url, options = {}) {
  const response = await axios.get(url, {
    timeout: 8000,
    ...options,
  });
  return {
    status:  response.status,
    data:    response.data,
    headers: response.headers,
  };
}

/**
 * nodeFetch
 * Fetches a URL using node-fetch.
 *
 * VULNERABLE: node-fetch 2.6.5 — CVE-2022-0235
 * When following a redirect, node-fetch forwards the Authorization header
 * to the redirect destination regardless of host — leaking credentials.
 * Fix: upgrade node-fetch to 2.6.7.
 */
async function nodeFetch(url, options = {}) {
  const response = await fetch(url, { timeout: 8000, ...options });
  const text = await response.text();
  return {
    status:  response.status,
    body:    text,
    headers: Object.fromEntries(response.headers.entries()),
  };
}

module.exports = { axiosFetch, nodeFetch };
