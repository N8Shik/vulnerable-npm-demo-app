'use strict';

const { formatProductTemplate, parseConfig, groupByCategory, safeClone } = require('../src/utils/helpers');
const { generateToken, verifyToken, decodeToken } = require('../src/services/tokenService');
const { getDefaultConfig, parseArgs } = require('../src/config/loader');

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
