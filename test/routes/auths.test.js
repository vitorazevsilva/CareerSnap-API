const request = require('supertest');

const app = require('../../src/app');
const { faker } = require('@faker-js/faker/locale/pt_PT');

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
  await app.services.user.save(_mainData[0]);
  await app.services.user.save(_mainData[1]);
  _mainData[1].recovery_key = await app.services.user.genRecovery(_mainData[1].email,true);
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

test('[AUTH][8] - Register with an existing email', () => {
  const dataAdd = {... _mainData[0]}
  dataAdd.phone = faker.phone.number('+351 96#######');
  return request(app).post('/auth/signup')
    .send(dataAdd)
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Email is already registered');
      expect(res.body).not.toHaveProperty('token');
    });
});

test('[AUTH][9] - Register with an existing phone number', () => {
  const dataAdd = {... _mainData[0]}
  dataAdd.email = faker.internet.email();
  return request(app).post('/auth/signup')
    .send(dataAdd)
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Phone is already registered');
      expect(res.body).not.toHaveProperty('token');
    });
});

test('[AUTH][10] - Sign in with the correct credentials', () => {
  return request(app).post('/auth/signin')
    .send({email: _mainData[0].email, password: _mainData[0].password})
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Correct Credentials');
      expect(res.body).toHaveProperty('token');
    });
});

test('[AUTH][11] - Sign in with the incorrect credentials', () => {
  return request(app).post('/auth/signin')
    .send({email: _mainData[0].email, password: 'mypassword'})
    .then((res) => {
      expect(res.status).toBe(403);
      expect(res.body.message).toBe('Incorrect Credentials');
      expect(res.body).not.toHaveProperty('token');
    });
});

test('[AUTH][12] - Sign in without a credentials field (password)', () => {
  return request(app).post('/auth/signin')
    .send({email: _mainData[0].email})
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Password is a mandatory attribute');
      expect(res.body).not.toHaveProperty('token');
    });
});

test('[AUTH][13] - Sign in without a credentials field (email)', () => {
  return request(app).post('/auth/signin')
    .send({password: _mainData[0].password})
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Email is a mandatory attribute');
      expect(res.body).not.toHaveProperty('token');
    });
});

test('[AUTH][14] - Recover password with correct email',  () => {
  return request(app).post('/auth/recovery')
    .send({email: _mainData[0].email})
    .then((res) => {
      expect(res.status).toBe(201);
      expect(res.body.message).toBe('If this email is registered in our system, you will receive an email to proceed with the recovery');
    });
});

test('[AUTH][15] - Recover password without email',  () => {
  return request(app).post('/auth/recovery')
    .send({})
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Email is a mandatory attribute');
    });
});

test('[AUTH][16] - Recover password with invalid email',  () => {
  return request(app).post('/auth/recovery')
    .send({email: 'alguem@exemplo.com'})
    .then((res) => {
      expect(res.status).toBe(201);
      expect(res.body.message).toBe('If this email is registered in our system, you will receive an email to proceed with the recovery');
    });
});

test('[AUTH][17] - Password change with everything correct', async () => {
  return request(app).put('/auth/recovery')
    .send({email: _mainData[1].email,recovery_key: _mainData[1].recovery_key, password: _mainData[1].password})
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Password Replaced Successfully');
    });
});

test('[AUTH][18] - Password change without an attribute', async () => {
  return request(app).put('/auth/recovery')
    .send({email: _mainData[1].email, password: _mainData[1].password})
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Recovery Key is a mandatory attribute');
    });
});

test('[AUTH][19] - Password change with an invalid recovery key', async () => {
  return request(app).put('/auth/recovery')
    .send({email: _mainData[1].email, recovery_key: 'myrecoverykey', password: _mainData[1].password})
    .then((res) => {
      expect(res.status).toBe(403);
      expect(res.body.message).toBe('Invalid Attributes, Recovery Key already used or expired');
    });
});

test('[AUTH][20] - Password change with a used recovery key', async () => {
  await app.db('account_recovery').where({recovery_key: _mainData[1].recovery_key}).update({used:true});
  return request(app).put('/auth/recovery')
    .send({email: _mainData[1].email, recovery_key: _mainData[1].recovery_key, password: _mainData[1].password})
    .then((res) => {
      expect(res.status).toBe(403);
      expect(res.body.message).toBe('Invalid Attributes, Recovery Key already used or expired');
    });
});

test('[AUTH][21] - Password change with a expired recovery key', async () => {
  await app.db('account_recovery').where({recovery_key: _mainData[1].recovery_key}).update({expires_at:new Date("2023-01-01T00:00:00")});
  return request(app).put('/auth/recovery')
    .send({email: _mainData[1].email, recovery_key: _mainData[1].recovery_key, password: _mainData[1].password})
    .then((res) => {
      expect(res.status).toBe(403);
      expect(res.body.message).toBe('Invalid Attributes, Recovery Key already used or expired');
    });
});

test('[AUTH][22] - Try to put invalid parameters', async () => {
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
    phone: faker.phone.number('+351 96#######'),
    test:'test'
  }

  return request(app).post('/auth/signup')
    .send(data)
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Invalid parameter received');
    });
});

