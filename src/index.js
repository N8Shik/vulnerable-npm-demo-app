'use strict';

require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const bodyParser = require('body-parser');

const productRoutes  = require('./routes/products');
const userRoutes     = require('./routes/users');
const reportRoutes   = require('./routes/reports');
const healthRoutes   = require('./routes/health');
const { requestLogger } = require('./middleware/logger');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(requestLogger);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/health',   healthRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/reports',  reportRoutes);

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`vulnerable-npm-demo listening on port ${PORT}`);
    console.log('WARNING: This app uses intentionally vulnerable packages — do not deploy to production.');
  });
}

module.exports = app;
