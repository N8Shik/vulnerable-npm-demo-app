'use strict';

const { formatProductTemplate, parseConfig, groupByCategory, safeClone } = require('../src/utils/helpers');
const { generateToken, verifyToken, decodeToken } = require('../src/services/tokenService');
const { getDefaultConfig, parseArgs } = require('../src/config/loader');

// ─────────────────────────────────────────────────────────────
// Verify pinned vulnerable versions are present (demo state)
// ─────────────────────────────────────────────────────────────
describe('Vulnerable version pinning (demo state verification)', () => {
  const semver = require('semver');

  it('lodash should be < 4.17.21 (CVE-2021-23337 / CVE-2020-28500)', () => {
    const { version } = require('lodash/package.json');
    expect(semver.lt(version, '4.17.21')).toBe(true);
  });

  it('moment should be < 2.29.2 (CVE-2022-24785)', () => {
    const { version } = require('moment/package.json');
    expect(semver.lt(version, '2.29.2')).toBe(true);
  });

  it('jsonwebtoken should be <= 8.5.1 (CVE-2022-23529)', () => {
    const { version } = require('jsonwebtoken/package.json');
    expect(semver.lte(version, '8.5.1')).toBe(true);
  });

  it('json5 should be < 2.2.2 (CVE-2022-46175)', () => {
    const { version } = require('json5/package.json');
    expect(semver.lt(version, '2.2.2')).toBe(true);
  });

  it('axios should be < 1.6.0 (CVE-2023-45857)', () => {
    const { version } = require('axios/package.json');
    expect(semver.lt(version, '1.6.0')).toBe(true);
  });

  it('xml2js should be < 0.5.0 (CVE-2023-0842)', () => {
    const { version } = require('xml2js/package.json');
    expect(semver.lt(version, '0.5.0')).toBe(true);
  });

  it('tough-cookie should be < 4.1.3 (CVE-2023-26136)', () => {
    const { version } = require('tough-cookie/package.json');
    expect(semver.lt(version, '4.1.3')).toBe(true);
  });

  it('marked should be < 4.0.10 (CVE-2022-21680)', () => {
    const { version } = require('marked/package.json');
    expect(semver.lt(version, '4.0.10')).toBe(true);
  });

  it('node-fetch should be < 2.6.7 (CVE-2022-0235)', () => {
    const { version } = require('node-fetch/package.json');
    expect(semver.lt(version, '2.6.7')).toBe(true);
  });

  it('follow-redirects should be < 1.15.4 (CVE-2023-26159)', () => {
    const { version } = require('follow-redirects/package.json');
    expect(semver.lt(version, '1.15.4')).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
describe('formatProductTemplate', () => {
  const product = { name: 'Widget', price: 9.99, category: 'widgets' };

  it('formats with default template', () => {
    const result = formatProductTemplate(product);
    expect(result).toContain('Widget');
    expect(result).toContain('9.99');
  });

  it('formats with custom template', () => {
    const result = formatProductTemplate(product, '<%= name %> in <%= category %>');
    expect(result).toBe('Widget in widgets');
  });
});

describe('parseConfig', () => {
  it('parses valid JSON5', () => {
    const result = parseConfig('{ port: 3000, /* comment */ name: "demo" }');
    expect(result.port).toBe(3000);
    expect(result.name).toBe('demo');
  });

  it('returns null for invalid config', () => {
    expect(parseConfig('not valid {')).toBeNull();
  });
});

describe('groupByCategory', () => {
  const products = [
    { id: '1', name: 'A', category: 'widgets' },
    { id: '2', name: 'B', category: 'gadgets' },
    { id: '3', name: 'C', category: 'widgets' },
  ];

  it('groups correctly', () => {
    const grouped = groupByCategory(products);
    expect(grouped.widgets).toHaveLength(2);
    expect(grouped.gadgets).toHaveLength(1);
  });
});

describe('safeClone', () => {
  it('deep-clones an object', () => {
    const obj    = { a: { b: 1 } };
    const cloned = safeClone(obj);
    cloned.a.b   = 99;
    expect(obj.a.b).toBe(1); // original unchanged
  });
});

// ─────────────────────────────────────────────────────────────
// Token service
// ─────────────────────────────────────────────────────────────
describe('tokenService', () => {
  it('generates and verifies a token round-trip', () => {
    const payload = { sub: 'u1', username: 'admin', role: 'ADMIN' };
    const token   = generateToken(payload);
    const decoded = verifyToken(token);
    expect(decoded.sub).toBe('u1');
    expect(decoded.username).toBe('admin');
  });

  it('decodes a token without verifying', () => {
    const token   = generateToken({ sub: 'test' });
    const decoded = decodeToken(token);
    expect(decoded.payload.sub).toBe('test');
    expect(decoded.header.alg).toBe('HS256');
  });
});

// ─────────────────────────────────────────────────────────────
// Config loader
// ─────────────────────────────────────────────────────────────
describe('getDefaultConfig', () => {
  it('returns an object with port and logLevel', () => {
    const config = getDefaultConfig();
    expect(config.port).toBeDefined();
    expect(config.logLevel).toBeDefined();
    expect(config.jwtExpiry).toBe('1h');
  });
});

describe('parseArgs', () => {
  it('parses basic flags', () => {
    const args = parseArgs(['--port', '4000', '--debug']);
    expect(args.port).toBe(4000);
    expect(args.debug).toBe(true);
  });
});
