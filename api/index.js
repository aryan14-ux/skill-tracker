const app = require('../backend/src/app');
const { sequelize } = require('../backend/src/models');
const { setMySQLConnected } = require('../backend/src/config/memoryStore');

let connection;

module.exports = async function handler(req, res) {
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
};
