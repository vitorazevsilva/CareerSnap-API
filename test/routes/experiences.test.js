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
    const result1 = await app.services.user.save(_mainData[0]);
    _mainData[0].id = result1[0].id
    _mainData[0].token = jwt.encode({ id: _mainData[0].id }, secret);
    const experience = {
        role: faker.name.jobType(),
        start_date: new Date(faker.date.past(faker.random.numeric())),
        end_date: new Date(),
        company: faker.company.name(),
        description: faker.name.jobTitle()
    }
    console.log(experience)
    _mainData[0].experiences = []
    const result2 = await app.services.experience.save(_mainData[0].id, experience)
    _mainData[0].experiences[0] = result2[0];
    const result3 = await app.services.user.save(_mainData[1]);
    _mainData[1].id = result3[0].id
    _mainData[1].token = jwt.encode({ id: _mainData[1].id }, secret);
})

test('[EXPERIENCE][1] - Create experiences correctly', () => {
    const experience = {
        role: faker.name.jobType(),
        start_date: new Date(faker.date.past(faker.random.numeric())),
        end_date: new Date(),
        company: faker.company.name(),
        description: faker.name.jobTitle()
    }
    return request(app).post('/v1/experience')
        .send(experience)
        .set('authorization', `bearer ${_mainData[0].token}`)
        .then((res) => {
            expect(res.status).toBe(201);
            expect(res.body.message).toBe('Created Experience Successfully');
            expect(res.body).toHaveProperty('content')
        });
});

test('[EXPERIENCE][2] - Create without an attribute (start_date)', () => {
    const experience = {
        role: faker.name.jobType(),
        end_date: new Date(),
        company: faker.company.name(),
        description: faker.name.jobTitle()
    }
    return request(app).post('/v1/experience')
        .send(experience)
        .set('authorization', `bearer ${_mainData[0].token}`)
        .then((res) => {
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Start date is a mandatory attribute');
        });
});

test('[EXPERIENCE][3] - Create with a start date greater than the current one', () => {
    const experience = {
        role: faker.name.jobType(),
        start_date: new Date(faker.date.future(faker.random.numeric())),
        end_date: new Date(),
        company: faker.company.name(),
        description: faker.name.jobTitle()
    }
    return request(app).post('/v1/experience')
        .send(experience)
        .set('authorization', `bearer ${_mainData[0].token}`)
        .then((res) => {
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Start date is not valid');
        });
});


test('[EXPERIENCE][4] - Create with a end date greater than the current one', () => {
    const experience = {
        role: faker.name.jobType(),
        start_date: new Date(faker.date.past(faker.random.numeric())),
        end_date: new Date(faker.date.future(faker.random.numeric())),
        company: faker.company.name(),
        description: faker.name.jobTitle()
    }
    return request(app).post('/v1/experience')
        .send(experience)
        .set('authorization', `bearer ${_mainData[0].token}`)
        .then((res) => {
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('End date is not valid');
        });
});

test('[EXPERIENCE][5] - Create with a start date greater than the end date', () => {
    const experience = {
        role: faker.name.jobType(),
        start_date: new Date(),
        end_date: new Date(faker.date.past(faker.random.numeric())),
        company: faker.company.name(),
        description: faker.name.jobTitle()
    }
    return request(app).post('/v1/experience')
        .send(experience)
        .set('authorization', `bearer ${_mainData[0].token}`)
        .then((res) => {
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Start date greater than end date');
        });
});

test('[EXPERIENCE][6] - Create with extra attributes', () => {
    const experience = {
        role: faker.name.jobType(),
        start_date: new Date(faker.date.past(faker.random.numeric())),
        end_date: new Date(),
        company: faker.company.name(),
        description: faker.name.jobTitle(),
        test: 'test'
    }
    return request(app).post('/v1/experience')
        .send(experience)
        .set('authorization', `bearer ${_mainData[0].token}`)
        .then((res) => {
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Invalid parameter received');
        });
});

test('[EXPERIENCE][7] - Reading all experiences', () => {
    return request(app).post('/v1/experience/search')
        .send()
        .set('authorization', `bearer ${_mainData[0].token}`)
        .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Experiences Read Successfully');
            expect(res.body).toHaveProperty('content')
        });
});

test('[EXPERIENCE][8] - Reading all experiences of the end year', () => {
    return request(app).post('/v1/experience/search')
        .send({ end_date: new Date() })
        .set('authorization', `bearer ${_mainData[0].token}`)
        .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Experiences Read Successfully');
            expect(res.body).toHaveProperty('content')
        });
});

test('[EXPERIENCE][9] - Reading all experiences of the user', () => {
    return request(app).post('/v1/experience/search')
        .send({ user_id: _mainData[0].id })
        .set('authorization', `bearer ${_mainData[0].token}`)
        .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Experiences Read Successfully');
            expect(res.body).toHaveProperty('content')
        });
});

test('[EXPERIENCE][10] - Reading experience with correct id', () => {

    return request(app).get(`/v1/experience/${_mainData[0].experiences[0].id}`)
        .send()
        .set('authorization', `bearer ${_mainData[0].token}`)
        .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Experience Read Successfully');
        });
});

test('[EXPERIENCE][11] - Reading experience with incorrect id', () => {
    return request(app).get('/v1/experience/999999999')
        .send()
        .set('authorization', `bearer ${_mainData[0].token}`)
        .then((res) => {
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Incorrect ID');
        });
});

test('[EXPERIENCE][12] - Reading experience with invalid id (length)', () => {
    return request(app).get('/v1/experience/715762634852')
        .send()
        .set('authorization', `bearer ${_mainData[0].token}`)
        .then((res) => {
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Invalid ID');
        });
});

test('[EXPERIENCE][13] - Reading experience with invalid id (letters)', () => {
    return request(app).get('/v1/experience/aaaa')
        .send()
        .set('authorization', `bearer ${_mainData[0].token}`)
        .then((res) => {
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Invalid ID');
        });
});

test('[EXPERIENCE][14] - Update experience with all correct parameters', () => {
    const experience = {
        role: faker.name.jobType(),
        start_date: new Date(faker.date.past(faker.random.numeric())),
        end_date: new Date(),
        company: faker.company.name(),
        description: faker.name.jobTitle()
    }
    console.log(experience)
    return request(app).put(`/v1/experience/${_mainData[0].experiences[0].id}`)
        .send(experience)
        .set('authorization', `bearer ${_mainData[0].token}`)
        .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Experience Updated Successfully');
            expect(res.body.content.company).toBe(experience.company);
            expect(res.body.content.role).not.toBe(_mainData[0].experiences[0].role);
        });
});

test('[EXPERIENCE][15] - Update experience with some of the parameters', () => {
    const experience = {
        company: faker.company.name(),
        description: faker.name.jobTitle()
    }
    return request(app).put(`/v1/experience/${_mainData[0].experiences[0].id}`)
        .send(experience)
        .set('authorization', `bearer ${_mainData[0].token}`)
        .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Experience Updated Successfully');
            expect(res.body.content.company).toBe(experience.company);
            expect(res.body.content.description).not.toBe(_mainData[0].experiences[0].description);
        });
});

test('[EXPERIENCE][16] - Update experience with an incorrect id', () => {
    return request(app).put(`/v1/experience/999999999`)
        .send({ company: faker.company.name() })
        .set('authorization', `bearer ${_mainData[0].token}`)
        .then((res) => {
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Incorrect id or without permission');
            expect(res.body).not.toHaveProperty('content')
        });
});

test('[EXPERIENCE][17] - Update experience with invalid id (letters)', () => {
    return request(app).put(`/v1/experience/abc`)
        .send({ company: faker.company.name() })
        .set('authorization', `bearer ${_mainData[0].token}`)
        .then((res) => {
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Invalid ID');
            expect(res.body).not.toHaveProperty('content')
        });
});

test('[EXPERIENCE][18] - Update experience with invalid id (length)', () => {
    return request(app).put(`/v1/experience/9999999990`)
        .send({ company: faker.company.name() })
        .set('authorization', `bearer ${_mainData[0].token}`)
        .then((res) => {
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Invalid ID');
            expect(res.body).not.toHaveProperty('content')
        });
});

test('[EXPERIENCE][19] - Update another user\'s experience', () => {
    return request(app).put(`/v1/experience/${_mainData[0].experiences[0].id}`)
        .send({ company: faker.company.name() })
        .set('authorization', `bearer ${_mainData[1].token}`)
        .then((res) => {
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Incorrect id or without permission');
            expect(res.body).not.toHaveProperty('content')
        });
});

test('[EXPERIENCE][20] - Update with a start date greater than the current one', () => {
    return request(app).put(`/v1/experience/${_mainData[0].experiences[0].id}`)
        .send({ start_date: new Date('2050-11-10T16:35:17') })
        .set('authorization', `bearer ${_mainData[0].token}`)
        .then((res) => {
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Start date is not valid');
            expect(res.body).not.toHaveProperty('content')
        });
});

test('[EXPERIENCE][21] - Update with a completion date greater than the current one', () => {
    return request(app).put(`/v1/experience/${_mainData[0].experiences[0].id}`)
        .send({ end_date: new Date('2051-11-10T16:35:17') })
        .set('authorization', `bearer ${_mainData[0].token}`)
        .then((res) => {
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('End date is not valid');
            expect(res.body).not.toHaveProperty('content')
        });
});

test('[EXPERIENCE][22] - Update with a start date greater than the completion date', () => {
    return request(app).put(`/v1/experience/${_mainData[0].experiences[0].id}`)
        .send({ start_date: new Date(), end_date: new Date(faker.date.past(faker.random.numeric())), })
        .set('authorization', `bearer ${_mainData[0].token}`)
        .then((res) => {
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Start date greater than end date');
            expect(res.body).not.toHaveProperty('content')
        });
});

test('[EXPERIENCE][23] - Update with a start date later than the previously saved finish date', () => {
    return request(app).put(`/v1/experience/${_mainData[0].experiences[0].id}`)
        .send({ start_date: new Date() })
        .set('authorization', `bearer ${_mainData[0].token}`)
        .then((res) => {
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Start date greater than end date');
            expect(res.body).not.toHaveProperty('content')
        });
});

test('[EXPERIENCE][24] - Update with extra attributes', () => {
    return request(app).put(`/v1/experience/${_mainData[0].experiences[0].id}`)
        .send({ test: 'test' })
        .set('authorization', `bearer ${_mainData[0].token}`)
        .then((res) => {
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Invalid parameter received');
            expect(res.body).not.toHaveProperty('content')
        });
});

test('[EXPERIENCE][25] - Delete experience with all correct parameters', () => {
    return request(app).delete(`/v1/experience/${_mainData[0].experiences[0].id}`)
        .send()
        .set('authorization', `bearer ${_mainData[0].token}`)
        .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Experience Deleted Successfully');
        });
});

test('[EXPERIENCE][26] - Delete experience with invalid id (letters)', () => {
    return request(app).put(`/v1/experience/abc`)
        .send()
        .set('authorization', `bearer ${_mainData[0].token}`)
        .then((res) => {
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Invalid ID');
        });
});

test('[EXPERIENCE][27] - Delete experience with invalid id (length)', () => {
    return request(app).put(`/v1/experience/9999999999`)
        .send()
        .set('authorization', `bearer ${_mainData[0].token}`)
        .then((res) => {
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Invalid ID');
        });
});

test('[EXPERIENCE][28] - Delete experience with an incorrect id', () => {
    return request(app).put(`/v1/experience/999999999`)
        .send()
        .set('authorization', `bearer ${_mainData[0].token}`)
        .then((res) => {
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Incorrect id or without permission');
        });
});

test('[EXPERIENCE][29] - Delete another user\'s experience', () => {
    return request(app).put(`/v1/experience/${_mainData[0].experiences[0].id}`)
        .send()
        .set('authorization', `bearer ${_mainData[1].token}`)
        .then((res) => {
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Incorrect id or without permission');
        });
});