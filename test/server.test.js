const supertest = require('supertest');

const request = supertest('http://localhost:3001');

test.skip('[SERVER][1] - Validate if the node runs at 3001', () => {
  return request.get('/').then((res) => expect(res.status).toBe(200));
});
