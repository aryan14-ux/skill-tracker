const { test } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const express = require('express');

process.env.VERCEL = '1';
delete process.env.DB_HOST;
process.env.JWT_SECRET = 'test-only-serverless-secret';
const handler = require('../../api/index');

test('serverless handler serves health and demo authentication without starting a database', async t => {
  const app = express();
  app.use(handler);
  const server = app.listen(0, '127.0.0.1');
  t.after(() => new Promise(resolve => server.close(resolve)));
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  assert.equal((await fetch(`${base}/api/health`)).status, 200);
  const login = await fetch(`${base}/api/auth/demo-login/student`);
  assert.equal(login.status, 200);
  assert.ok((await login.json()).token);
  const { uploadsRoot } = require('../src/config/uploads');
  assert.equal(require('path').dirname(uploadsRoot), require('os').tmpdir());
  delete process.env.JWT_SECRET;
  assert.equal((await fetch(`${base}/api/health`)).status, 503);
});
