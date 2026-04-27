'use strict';

/**
 * utils/helpers.js
 *
 * Vulnerable packages exercised here:
 *   lodash      4.17.20 — CVE-2021-23337 (_.template command injection)
 *                         CVE-2020-28500 (ReDoS in toNumber / trim)
 *   json5       2.2.0   — CVE-2022-46175 (prototype pollution via parse())
 *   tough-cookie 4.1.2  — CVE-2023-26136 (prototype pollution via CookieJar)
 *
 * Fix: bump versions in package.json + add overrides block. Zero code changes.
 */

const _     = require('lodash');         // CVE-2021-23337, CVE-2020-28500
const JSON5 = require('json5');          // CVE-2022-46175
const { CookieJar } = require('tough-cookie'); // CVE-2023-26136

/**
 * formatProductTemplate
 * Uses _.template to build a display string from a product.
 *
 * VULNERABLE: lodash 4.17.20 — CVE-2021-23337
 * If `templateStr` comes from user input, the `options.imports` keys are not
 * sanitised and allow code injection via Function() constructor.
 * Fix: upgrade lodash to 4.17.21 where imports key validation is complete.
 */
function formatProductTemplate(product, templateStr) {
  const tmpl = _.template(templateStr || '<%= name %> — $<%= price %>');
  return tmpl(product);
}

/**
 * parseConfig
 * Parses a JSON5 configuration string (relaxed JSON with comments, etc.)
 *
 * VULNERABLE: json5 2.2.0 — CVE-2022-46175
 * A crafted JSON5 string with __proto__ key pollutes Object.prototype.
 * Fix: upgrade json5 to 2.2.2 — parser hardened internally, no code change.
 */
function parseConfig(configStr) {
  try {
    return JSON5.parse(configStr);
  } catch (e) {
    return null;
  }
}

/**
 * buildCookieJar
 * Creates a tough-cookie CookieJar for HTTP client sessions.
 *
 * VULNERABLE: tough-cookie 4.1.2 — CVE-2023-26136
 * CookieJar.setCookie() with a malicious cookie string can pollute
 * Object.prototype. Transitive via many HTTP client libraries.
 * Fix: upgrade tough-cookie to 4.1.3 — fixed internally, no code change.
 */
function buildCookieJar() {
  return new CookieJar();
}

/**
 * groupByCategory
 * Groups a list of products by their category using lodash.
 * lodash 4.17.20 — _.groupBy is not itself vulnerable but the package is.
 */
function groupByCategory(products) {
  return _.groupBy(products, 'category');
}

/**
 * safeClone
 * Deep-clones an object using lodash cloneDeep.
 * lodash 4.17.20 — _.cloneDeep is safe to use; CVE is in _.template / toNumber.
 */
function safeClone(obj) {
  return _.cloneDeep(obj);
}

module.exports = {
  formatProductTemplate,
  parseConfig,
  buildCookieJar,
  groupByCategory,
  safeClone,
};
