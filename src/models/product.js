'use strict';

const { v4: uuidv4 } = require('uuid');

/**
 * In-memory product store — keeps the project self-contained for demo purposes.
 * No database dependency means fast clone + run.
 */
const store = new Map([
  ['p1', { id: 'p1', name: 'Widget Alpha',  description: 'Standard widget',    price: 9.99,   category: 'widgets',    createdAt: new Date().toISOString() }],
  ['p2', { id: 'p2', name: 'Widget Beta',   description: 'Premium widget',     price: 19.99,  category: 'widgets',    createdAt: new Date().toISOString() }],
  ['p3', { id: 'p3', name: 'Gadget X',      description: 'Entry-level gadget', price: 49.99,  category: 'gadgets',    createdAt: new Date().toISOString() }],
  ['p4', { id: 'p4', name: 'Gadget Pro',    description: 'Pro-grade gadget',   price: 99.99,  category: 'gadgets',    createdAt: new Date().toISOString() }],
  ['p5', { id: 'p5', name: 'Tool Basic',    description: 'Basic toolset',      price: 14.99,  category: 'tools',      createdAt: new Date().toISOString() }],
  ['p6', { id: 'p6', name: 'Sensor Alpha',  description: 'IoT temp sensor',    price: 29.99,  category: 'sensors',    createdAt: new Date().toISOString() }],
]);

const Product = {
  findAll() {
    return Array.from(store.values());
  },

  findById(id) {
    return store.get(id) || null;
  },

  findByCategory(category) {
    return Array.from(store.values()).filter(p => p.category === category);
  },

  create(data) {
    const product = {
      id:          uuidv4(),
      name:        data.name,
      description: data.description || '',
      price:       parseFloat(data.price),
      category:    data.category || 'general',
      createdAt:   new Date().toISOString(),
    };
    store.set(product.id, product);
    return product;
  },

  update(id, data) {
    const existing = store.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...data, id, updatedAt: new Date().toISOString() };
    store.set(id, updated);
    return updated;
  },

  delete(id) {
    return store.delete(id);
  },

  count() {
    return store.size;
  },
};

module.exports = Product;
