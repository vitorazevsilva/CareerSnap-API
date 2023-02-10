const request = require('supertest');
const jwt = require('jwt-simple');
const app = require('../src/app');
const { faker } = require('@faker-js/faker/locale/pt_PT');

const secret = 'careersnap';
const _mainData = [
    {
      email: faker.internet.email(),
      password: faker.internet.password(20, false),
      full_name: `${faker.name.firstName()} ${faker.name.middleName()} ${faker.name.lastName()}`,
      birth_date: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
      address: {
        street: faker.address.streetAddress(),
        city: faker.address.city(),
        state: faker.address.state(),
        zipCode: faker.address.zipCode()
      },
      country: faker.address.country(),
      nationality: 'Portuguese',
      phone: faker.phone.number('+351 96#######').replace(' ', '')
    },
  ]

beforeAll(async () => {
    let result = await app.services.user.save(_mainData[0]);
    _mainData[0].id = result[0].id
    _mainData[0].token = jwt.encode({id:_mainData[0].id}, secret);
})

test('[PASSPORT][1] - Request with valid token', () => {
    return request(app).get('/v1/')
      .send()
      .set('authorization', `bearer ${_mainData[0].token}`)
      .then((res) => {
        expect(res.status).toBe(404);
      });
});

test('[PASSPORT][2] - Request with invalid token', () => {
    return request(app).get('/v1/')
      .send()
      .set('authorization', `bearer baac1de508fb43e285aec2802126a0a2`)
      .then((res) => {
        expect(res.status).toBe(401);
      });
});

test('[PASSPORT][3] - Request without valid token', () => {
    return request(app).get('/v1/')
      .send()
      .then((res) => {
        expect(res.status).toBe(401);
      });
});