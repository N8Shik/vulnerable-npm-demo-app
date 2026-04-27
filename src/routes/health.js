'use strict';

const express = require('express');
const router  = express.Router();

router.get('/', (req, res) => {
  res.json({
    status:  'UP',
    version: '1.0.0',
    note:    'This app uses intentionally vulnerable npm packages for demo purposes. DO NOT deploy to production.',
    uptime:  process.uptime(),
  });
});

module.exports = router;
