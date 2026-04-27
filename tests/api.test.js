'use strict';

const request = require('supertest');
const app     = require('../src/index');
const jwt     = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'demo-secret-not-for-production';

function makeToken(role = 'ADMIN') {
  return jwt.sign({ sub: 'u1', username: 'admin', role }, JWT_SECRET, { expiresIn: '1h' });
}

// ─────────────────────────────────────────────────────────────
// Health
// ─────────────────────────────────────────────────────────────
describe('GET /api/health', () => {
  it('returns 200 with status UP', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('UP');
  });
});

// ─────────────────────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────────────────────
describe('POST /api/users/login', () => {
  it('returns token for valid credentials', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ username: 'admin', password: 'admin123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('returns 401 for wrong password', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ username: 'admin', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  it('returns 401 for unknown user', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ username: 'nobody', password: 'x' });
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────────
// Products
// ─────────────────────────────────────────────────────────────
describe('GET /api/products', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(401);
  });

  it('returns product list with valid token', async () => {
    const token = makeToken();
    const res   = await request(app)
      .get('/api/products')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.products)).toBe(true);
    expect(res.body.count).toBeGreaterThan(0);
  });
});

describe('POST /api/products', () => {
  it('creates a new product', async () => {
    const token = makeToken();
    const res   = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Widget', price: 5.99, category: 'test' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Test Widget');
    expect(res.body.id).toBeDefined();
  });

  it('returns 400 without required fields', async () => {
    const token = makeToken();
    const res   = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ description: 'no name or price' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/products/:id', () => {
  it('returns 404 for missing product', async () => {
    const token = makeToken();
    const res   = await request(app)
      .get('/api/products/does-not-exist')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  it('returns existing product', async () => {
    const token = makeToken();
    const res   = await request(app)
      .get('/api/products/p1')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe('p1');
  });
});

// ─────────────────────────────────────────────────────────────
// Reports
// ─────────────────────────────────────────────────────────────
describe('GET /api/reports/catalogue', () => {
  it('returns HTML catalogue', async () => {
    const token = makeToken();
    const res   = await request(app)
      .get('/api/reports/catalogue')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.type).toMatch(/html/);
    expect(res.text).toContain('Product Catalogue');
  });
});

describe('POST /api/reports/parse-xml', () => {
  it('parses valid XML', async () => {
    const token = makeToken();
    const res   = await request(app)
      .post('/api/reports/parse-xml')
      .set('Authorization', `Bearer ${token}`)
      .send({ xml: '<root><item>hello</item></root>' });
    expect(res.status).toBe(200);
    expect(res.body.parsed).toBeDefined();
  });

  it('returns 400 for malformed XML', async () => {
    const token = makeToken();
    const res   = await request(app)
      .post('/api/reports/parse-xml')
      .set('Authorization', `Bearer ${token}`)
      .send({ xml: '<unclosed>' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/reports/summary', () => {
  it('returns summary with product count', async () => {
    const token = makeToken();
    const res   = await request(app)
      .get('/api/reports/summary')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.totalProducts).toBeGreaterThan(0);
    expect(res.body.byCategory).toBeDefined();
  });
});
