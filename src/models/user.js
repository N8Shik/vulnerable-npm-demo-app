'use strict';

const bcrypt     = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const store = new Map([
  ['u1', { id: 'u1', username: 'admin', email: 'admin@demo.com', passwordHash: bcrypt.hashSync('admin123', 8), role: 'ADMIN' }],
  ['u2', { id: 'u2', username: 'alice', email: 'alice@demo.com', passwordHash: bcrypt.hashSync('alice123', 8), role: 'USER' }],
  ['u3', { id: 'u3', username: 'bob',   email: 'bob@demo.com',   passwordHash: bcrypt.hashSync('bob123',   8), role: 'USER' }],
]);

const User = {
  findAll() {
    return Array.from(store.values()).map(u => {
      const { passwordHash, ...safe } = u;
      return safe;
    });
  },

  findById(id) {
    const u = store.get(id);
    if (!u) return null;
    const { passwordHash, ...safe } = u;
    return safe;
  },

  findByUsername(username) {
    return Array.from(store.values()).find(u => u.username === username) || null;
  },

  create(data) {
    const user = {
      id:           uuidv4(),
      username:     data.username,
      email:        data.email,
      passwordHash: bcrypt.hashSync(data.password, 8),
      role:         data.role || 'USER',
      createdAt:    new Date().toISOString(),
    };
    store.set(user.id, user);
    const { passwordHash, ...safe } = user;
    return safe;
  },
};

module.exports = User;
