'use strict';

const request = require('supertest');
const { createApp } = require('../../src/app');

/** Integration: API layer smoke tests (REQ-25 error handling, security headers REQ-24) */

describe('API smoke tests', () => {
  const app = createApp();

  test('TC-INT-01 GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('TC-INT-02 unknown route returns a safe 404 JSON error', async () => {
    const res = await request(app).get('/nope');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Not found' });
  });

  test('TC-INT-03 security headers are set (helmet)', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  test('TC-INT-04 malformed JSON returns 400 without leaking internals', async () => {
    const res = await request(app).post('/health').set('Content-Type', 'application/json').send('{bad json');
    expect(res.status).toBe(400);
    expect(JSON.stringify(res.body)).not.toMatch(/node_modules|at .*\.js/);
  });
});
