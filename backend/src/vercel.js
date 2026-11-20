const express = require('express');
const app = require('./app');
const { sequelize } = require('./models');
const { setMySQLConnected } = require('./config/memoryStore');

const service = express();

let connection;

service.use(async function handler(req, res) {
  if (!process.env.JWT_SECRET) {
    return res.status(503).json({ success: false, message: 'Set JWT_SECRET in the deployment environment.' });
  }

  // No database configured: use the demo store. Never silently fall back when
  // a configured database is unavailable, or writes could be lost.
  if (process.env.DB_HOST) {
    try {
      if (!connection) {
        connection = sequelize.authenticate().then(() => setMySQLConnected(true));
      }
      await connection;
    } catch (error) {
      connection = undefined;
      console.error('Database connection failed:', error.name);
      return res.status(503).json({ success: false, message: 'Database is unavailable. Please try again later.' });
    }
  }

  return app(req, res);
});

// Vercel owns the HTTP listener. Local development uses src/server.js.
module.exports = service;
