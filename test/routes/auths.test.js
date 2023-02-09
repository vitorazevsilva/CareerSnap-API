const request = require('supertest');

const app = require('../../src/app');
const { faker } = require('@faker-js/faker/locale/pt_PT');

const main_data = {
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
}

beforeAll(async () => {
  await app.db('users').insert(main_data);
})

test('[AUTH][1] - Register with correct data', () => {
  const data = {
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
    phone: faker.phone.number('+351 96#######')
  }
  console.log(data)
  return request(app).post('/auth/signup')
    .send(data)
    .then((res) => {
      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Successful Created Account');
      expect(res.body).toHaveProperty('token');
    });
});

test('[AUTH][2] - Register without a field (birth_date)', () => {
  const data = {
    email: faker.internet.email(),
    password: faker.internet.password(20, false),
    full_name: `${faker.name.firstName()} ${faker.name.middleName()} ${faker.name.lastName()}`,
    address: {
      street: faker.address.streetAddress(),
      city: faker.address.city(),
      state: faker.address.state(),
      zipCode: faker.address.zipCode()
    },
    country: faker.address.country(),
    nationality: 'Portuguese',
    phone: faker.phone.number('+351 96#######'),
  }
  return request(app).post('/auth/signup')
    .send(data)
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Date of birth is a mandatory attribute');
      expect(res.body).not.toHaveProperty('token');
    });
});

test('[AUTH][3] - Register an invalid name', () => {
  const data = {
    email: faker.internet.email(),
    password: faker.internet.password(20, false),
    full_name: `${faker.name.firstName()} ${faker.name.lastName()}`,
    birth_date: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
    address: {
      street: faker.address.streetAddress(),
      city: faker.address.city(),
      state: faker.address.state(),
      zipCode: faker.address.zipCode()
    },
    country: faker.address.country(),
    nationality: 'Portuguese',
    phone: faker.phone.number('+351 96#######'),
  }
  return request(app).post('/auth/signup')
    .send(data)
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Full name is not valid');
      expect(res.body).not.toHaveProperty('token');
    });
});

test('[AUTH][4] - Register an invalid email', () => {
  const data = {
    email: 'teste@email',
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
    phone: faker.phone.number('+351 96#######'),
  }
  return request(app).post('/auth/signup')
    .send(data)
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Email is not valid');
      expect(res.body).not.toHaveProperty('token');
    });
});

test('[AUTH][5] - Register with an insecure password', () => {
  const data = {
    email: faker.internet.email(),
    password: faker.internet.password(20, true),
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
    phone: faker.phone.number('+351 96#######')
  }

  return request(app).post('/auth/signup')
    .send(data)
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Password is not secure');
      expect(res.body).not.toHaveProperty('token');
    });
});

test('[AUTH][6] - Register with an invalid date', () => {
  const data = {
    email: faker.internet.email(),
    password: faker.internet.password(20, false),
    full_name: `${faker.name.firstName()} ${faker.name.middleName()} ${faker.name.lastName()}`,
    birth_date: faker.date.birthdate({ min: 1, max: 10, mode: 'age' }),
    address: {
      street: faker.address.streetAddress(),
      city: faker.address.city(),
      state: faker.address.state(),
      zipCode: faker.address.zipCode()
    },
    country: faker.address.country(),
    nationality: 'Portuguese',
    phone: faker.phone.number('+351 96#######')
  }

  return request(app).post('/auth/signup')
    .send(data)
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Date of birth is not valid');
      expect(res.body).not.toHaveProperty('token');
    });
});

test('[AUTH][7] - Register with an invalid phone number', () => {
  const data = {
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
    phone: faker.phone.number('### ### ###')
  }

  return request(app).post('/auth/signup')
    .send(data)
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Phone is not valid');
      expect(res.body).not.toHaveProperty('token');
    });
});

test('[AUTH][8] - Register with an existing email', async () => {
  const dataAdd = {... main_data}
  dataAdd.phone = faker.phone.number('+351 96#######');
  return request(app).post('/auth/signup')
    .send(dataAdd)
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Email is already registered');
      expect(res.body).not.toHaveProperty('token');
    });
});

test('[AUTH][9] - Register with an existing phone number', async () => {
  const dataAdd = {... main_data}
  dataAdd.email = faker.internet.email();
  return request(app).post('/auth/signup')
    .send(dataAdd)
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Phone is already registered');
      expect(res.body).not.toHaveProperty('token');
    });
});