const request = require('supertest');
const jwt = require('jwt-simple');
const app = require('../../src/app');
const { faker } = require('@faker-js/faker/locale/pt_PT');

const secret = 'careersnap';
const _mainData = [{
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
    }
]

beforeAll(async() => {
    let result = await app.services.user.save(_mainData[0]);
    _mainData[0].id = result[0].id
    _mainData[0].token = jwt.encode({ id: _mainData[0].id }, secret);
    const result3 = await app.services.user.save(_mainData[1]);
    _mainData[1].id = result3[0].id
    _mainData[1].token = jwt.encode({ id: _mainData[1].id }, secret);
})

test('[USER][1] - Reading all data', () => {
    return request(app).get('/v1/user')
        .send()
        .set('authorization', `bearer ${_mainData[0].token}`)
        .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Data Read Successfully');
            expect(res.body.content).toHaveProperty('full_name')
            expect(res.body.content).not.toHaveProperty('password')
        });
});

test('[USER][2] - Update some data', () => {
    const data = {
        country: faker.address.country(),
        nationality: 'Portuguese',
        phone: faker.phone.number('+351 96#######').replace(' ', '')
    }
    return request(app).put('/v1/user')
        .send(data)
        .set('authorization', `bearer ${_mainData[0].token}`)
        .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Data Updated Successfully');
            expect(res.body.content.country).toBe(data.country)
            expect(res.body.content.nationality).toBe(data.nationality)
            expect(res.body.content.phone).toBe(data.phone)
            expect(res.body.content).not.toHaveProperty('password')
        });
});

test('[USER][3] - Try to change id', () => {
    return request(app).put('/v1/user')
        .send({ id: faker.random.numeric(5) })
        .set('authorization', `bearer ${_mainData[0].token}`)
        .then((res) => {
            expect(res.status).toBe(409);
            expect(res.body.message).toBe('Id cannot be updated');
        });
});

test('[USER][4] - Try to put an invalid full name', () => {
    return request(app).put('/v1/user')
        .send({ full_name: `${faker.name.firstName()} ${faker.name.lastName()}` })
        .set('authorization', `bearer ${_mainData[0].token}`)
        .then((res) => {
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Full name is not valid');
        });
});

test('[USER][5] - Try to enter an email already registered', async() => {
    return request(app).put('/v1/user')
        .send({ email: _mainData[1].email })
        .set('authorization', `bearer ${_mainData[0].token}`)
        .then((res) => {
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Email is already registered');
        });
});

test('[USER][6] - Try entering invalid email', () => {
    return request(app).put('/v1/user')
        .send({ email: 'teste@email' })
        .set('authorization', `bearer ${_mainData[0].token}`)
        .then((res) => {
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Email is not valid');
        });
});

test('[USER][7] - Try entering an insecure password', () => {
    return request(app).put('/v1/user')
        .send({ password: faker.internet.password(20, true) })
        .set('authorization', `bearer ${_mainData[0].token}`)
        .then((res) => {
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Password is not secure');
        });
});

test('[USER][8] - Try to put invalid date', () => {
    return request(app).put('/v1/user')
        .send({ birth_date: faker.date.birthdate({ min: 1, max: 10, mode: 'age' }) })
        .set('authorization', `bearer ${_mainData[0].token}`)
        .then((res) => {
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Date of birth is not valid');
        });
});

test('[USER][9] - Try to put invalid phone number', () => {
    return request(app).put('/v1/user')
        .send({ phone: faker.phone.number('### ### ###') })
        .set('authorization', `bearer ${_mainData[0].token}`)
        .then((res) => {
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Phone is not valid');
        });
});

test('[USER][10] - Try to put invalid parameters', () => {
    return request(app).put('/v1/user')
        .send({ test: 'test' })
        .set('authorization', `bearer ${_mainData[0].token}`)
        .then((res) => {
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Invalid parameter received');
        });
});

test('[USER][11] - Reading all data of user', () => {
    return request(app).get(`/v1/user/${_mainData[0].id}`)
        .send()
        .set('authorization', `bearer ${_mainData[0].token}`)
        .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Data Read Successfully');
            expect(res.body.content).toHaveProperty('full_name')
            expect(res.body.content).not.toHaveProperty('password')
        });
});