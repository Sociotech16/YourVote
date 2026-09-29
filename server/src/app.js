'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
  app.use(express.json({ limit: '10kb' }));

  // Used for Render warm-ups, k6 and uptime checks
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', env: process.env.NODE_ENV || 'development', time: new Date().toISOString() });
  });

  app.use((req, res) => res.status(404).json({ error: 'Not found' }));

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    const status = err.status || 500;
    res.status(status).json({ error: status === 500 ? 'Internal server error' : err.message });
  });

  return app;
}

module.exports = { createApp };
