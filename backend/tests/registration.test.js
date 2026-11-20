const { test } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const app = require('../src/app');

test('registration form creates a student with the supplied details and can log in', async (t) => {
  // This app instance uses its own in-memory store; no running user data is changed.
  const { buildStudentRegistrationPayload } = await import('../../frontend/src/services/registrationPayload.js');
  const server = app.listen(0, '127.0.0.1');
  t.after(() => new Promise(resolve => server.close(resolve)));
  await once(server, 'listening');
  const baseURL = `http://127.0.0.1:${server.address().port}/api/auth`;
  const payload = buildStudentRegistrationPayload({
    fullName: ' Test Student ', email: ' Registration.Test@example.com ',
    password: 'TestPassword123!', confirmPassword: 'TestPassword123!',
    usn: ' test2026 ', phone: '1234567890', department: 'Computer Science',
    semester: '4', cgpa: '0', activeBacklogs: '2'
  });
  const post = (route, body) => fetch(`${baseURL}/${route}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  });
  const response = await post('register', payload);
  const registration = await response.json();
  assert.equal(response.status, 201, registration.message);
  assert.equal(registration.user.student.full_name, 'Test Student');
  assert.equal(registration.user.student.roll_no, 'TEST2026');
  assert.equal(Number(registration.user.student.cgpa), 0);
  assert.equal(registration.user.student.backlogs, 2);
  assert.equal(registration.user.student.semester, 4);
  const login = await post('login', { email: payload.email, password: payload.password });
  const session = await login.json();
  assert.equal(login.status, 200, session.message);
  assert.ok(session.token);
  const profile = await fetch(`${baseURL}/me`, { headers: { Authorization: `Bearer ${session.token}` } });
  assert.equal(profile.status, 200);
  assert.equal((await profile.json()).user.student.roll_no, 'TEST2026');
  assert.equal((await post('register', payload)).status, 409);
  assert.equal((await post('register', { ...payload, full_name: '' })).status, 400);
});
