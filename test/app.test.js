const request = require('supertest');

const app = require('../src/app');

test('[APP][1] - App to resolve at the root', () => {
  return request(app).get('/').then((res) => {
    expect(res.status).toBe(200);
  });
});
