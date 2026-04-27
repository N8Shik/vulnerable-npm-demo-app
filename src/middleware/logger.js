'use strict';

const moment = require('moment');   // CVE-2022-24785, CVE-2022-31129

function requestLogger(req, res, next) {
  // moment 2.29.1 — CVE-2022-31129: ReDoS via very long strings passed to moment()
  // Using it here for timestamp formatting — safe with Date object, vulnerable with
  // attacker-controlled string input. Fix: upgrade moment to 2.29.4+.
  const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
}

module.exports = { requestLogger };
