const request = require('supertest');
const jwt = require('jwt-simple');
const app = require('../../src/app');
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

beforeAll(async () => {
    const result1 = await app.services.user.save(_mainData[0]);
    _mainData[0].id = result1[0].id
    _mainData[0].token = jwt.encode({id:_mainData[0].id}, secret);
    const skill = {
        designation: faker.lorem.words(5),
        start_year: new Date(faker.date.past(faker.random.numeric())).getFullYear(),
        completion_year: new Date().getFullYear(),
        institution: faker.lorem.words(),
        field_of_study: faker.company.bsBuzz()
    }
    _mainData[0].skills = []
    const result2 = await app.services.skill.save(_mainData[0].id,skill)
    _mainData[0].skills[0] = result2[0];
    const result3 = await app.services.user.save(_mainData[1]);
    _mainData[1].id = result3[0].id
    _mainData[1].token = jwt.encode({id:_mainData[1].id}, secret);
})

test('[SKILL][1] - Create skill correctly', () => {
    let start = new Date(faker.date.past(faker.random.numeric())).getFullYear()
    let completion = new Date().getFullYear()
    const skill = {
        designation: faker.lorem.words(5),
        start_year: start,
        completion_year: completion,
        institution: faker.lorem.words(),
        field_of_study: faker.company.bsBuzz()
    }
    return request(app).post('/v1/skill')
      .send(skill)
      .set('authorization', `bearer ${_mainData[0].token}`)
      .then((res) => {
        expect(res.status).toBe(201);
        expect(res.body.message).toBe('Created Skill Successfully');
      });
});

test('[SKILL][2] - Create without an attribute (start_year)', () => {
    let completion = new Date().getFullYear()
    const skill = {
        designation: faker.lorem.words(5),
        completion_year: completion,
        institution: faker.lorem.words(),
        field_of_study: faker.company.bsBuzz()
    }
    return request(app).post('/v1/skill')
      .send(skill)
      .set('authorization', `bearer ${_mainData[0].token}`)
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Start year is a mandatory attribute');
      });
});

test('[SKILL][3] - Create with a start date greater than the current one', () => {
    const skill = {
        designation: faker.lorem.words(5),
        start_year: 2050,
        completion_year: 2051,
        institution: faker.lorem.words(),
        field_of_study: faker.company.bsBuzz()
    }
    return request(app).post('/v1/skill')
      .send(skill)
      .set('authorization', `bearer ${_mainData[0].token}`)
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Start year is not valid');
      });
});


test('[SKILL][4] - Create with a completion date greater than the current one', () => {
    let start = new Date(faker.date.past(faker.random.numeric())).getFullYear()
    const skill = {
        designation: faker.lorem.words(5),
        start_year: start,
        completion_year: 2051,
        institution: faker.lorem.words(),
        field_of_study: faker.company.bsBuzz()
    }
    return request(app).post('/v1/skill')
      .send(skill)
      .set('authorization', `bearer ${_mainData[0].token}`)
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Completion year is not valid');
      });
});

test('[SKILL][5] - Create with a start date greater than the completion date', () => {
    let start = new Date(faker.date.past(faker.random.numeric())).getFullYear()
    let completion = new Date().getFullYear()
    const skill = {
        designation: faker.lorem.words(5),
        start_year: completion,
        completion_year: start,
        institution: faker.lorem.words(),
        field_of_study: faker.company.bsBuzz()
    }
    return request(app).post('/v1/skill')
      .send(skill)
      .set('authorization', `bearer ${_mainData[0].token}`)
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Start year greater than completion year');
      });
});

test('[SKILL][6] - Create with extra attributes', () => {
    let start = new Date(faker.date.past(faker.random.numeric())).getFullYear()
    let completion = new Date().getFullYear()
    const skill = {
        designation: faker.lorem.words(5),
        start_year: start,
        completion_year: completion,
        institution: faker.lorem.words(),
        field_of_study: faker.company.bsBuzz(),
        test: 'test'
    }
    return request(app).post('/v1/skill')
      .send(skill)
      .set('authorization', `bearer ${_mainData[0].token}`)
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Invalid parameter received');
      });
});


test('[SKILL][7] - Reading all skills', () => {
    return request(app).get('/v1/skill')
      .send()
      .set('authorization', `bearer ${_mainData[0].token}`)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Skills Read Successfully');
      });
});

test('[SKILL][8] - Reading all skills of the completion year', () => {
    return request(app).get('/v1/skill')
      .send({completion_year: 2023})
      .set('authorization', `bearer ${_mainData[0].token}`)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Skills Read Successfully');
      });
});

test('[SKILL][9] - Reading all skills of the user', () => {
    return request(app).get('/v1/skill')
      .send({user_id: _mainData[0].id})
      .set('authorization', `bearer ${_mainData[0].token}`)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Skills Read Successfully');
      });
});

test('[SKILL][10] - Reading skill with correct id', () => {

    return request(app).get(`/v1/skill/${_mainData[0].skills[0].id}`)
      .send()
      .set('authorization', `bearer ${_mainData[0].token}`)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Skill Read Successfully');
      });
});

test('[SKILL][11] - Reading skill with incorrect id', () => {
    return request(app).get('/v1/skill/999999999')
      .send()
      .set('authorization', `bearer ${_mainData[0].token}`)
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Incorrect ID');
      });
});

test('[SKILL][12] - Reading skill with invalid id (length)', () => {
    return request(app).get('/v1/skill/715762634852')
      .send()
      .set('authorization', `bearer ${_mainData[0].token}`)
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Invalid ID');
      });
});

test('[SKILL][13] - Reading skill with invalid id (letters)', () => {
    return request(app).get('/v1/skill/aaaa')
      .send()
      .set('authorization', `bearer ${_mainData[0].token}`)
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Invalid ID');
      });
});

test('[SKILL][14] - Update skill with all correct parameters', () => {
    const skill = {
        designation: faker.lorem.words(5),
        start_year: new Date(faker.date.past(faker.random.numeric())).getFullYear(),
        completion_year: new Date().getFullYear(),
        institution: faker.lorem.words(),
        field_of_study: faker.company.bsBuzz(),
    }
    return request(app).put(`/v1/skill/${_mainData[0].skills[0].id}`)
      .send(skill)
      .set('authorization', `bearer ${_mainData[0].token}`)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Skill Updated Successfully');
        expect(res.body.content.institution).toBe(skill.institution);
        expect(res.body.content.field_of_study).not.toBe(_mainData[0].skills[0].field_of_study);
      });
});

test('[SKILL][15] - Update skill with some of the parameters', () => {
    const skill = {
        institution: faker.lorem.words(),
        field_of_study: faker.company.bsBuzz(),
    }
    return request(app).put(`/v1/skill/${_mainData[0].skills[0].id}`)
      .send(skill)
      .set('authorization', `bearer ${_mainData[0].token}`)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Skill Updated Successfully');
        expect(res.body.content.institution).toBe(skill.institution);
        expect(res.body.content.field_of_study).not.toBe(_mainData[0].skills[0].field_of_study);
      });
});

test('[SKILL][16] - Update skill with an incorrect id', () => {
    return request(app).put(`/v1/skill/999999999`)
      .send({institution: faker.lorem.words()})
      .set('authorization', `bearer ${_mainData[0].token}`)
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Incorrect id or without permission');
        expect(res.body).not.toHaveProperty('content')
      });
});

test('[SKILL][17] - Update skill with invalid id (letters)', () => {
    return request(app).put(`/v1/skill/abc`)
      .send({institution: faker.lorem.words()})
      .set('authorization', `bearer ${_mainData[0].token}`)
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Invalid ID');
        expect(res.body).not.toHaveProperty('content')
      });
});

test('[SKILL][18] - Update skill with invalid id (length)', () => {
    return request(app).put(`/v1/skill/9999999990`)
      .send({institution: faker.lorem.words()})
      .set('authorization', `bearer ${_mainData[0].token}`)
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Invalid ID');
        expect(res.body).not.toHaveProperty('content')
      });
});

test('[SKILL][19] - Update another user\'s skill', () => {
    return request(app).put(`/v1/skill/${_mainData[0].skills[0].id}`)
      .send({institution: faker.lorem.words()})
      .set('authorization', `bearer ${_mainData[1].token}`)
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Incorrect id or without permission');
        expect(res.body).not.toHaveProperty('content')
      });
});

test('[SKILL][20] - Update with a start date greater than the current one', () => {
    return request(app).put(`/v1/skill/${_mainData[0].skills[0].id}`)
      .send({start_year: 2050})
      .set('authorization', `bearer ${_mainData[0].token}`)
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Start year is not valid');
        expect(res.body).not.toHaveProperty('content')
      });
});

test('[SKILL][21] - Update with a completion date greater than the current one', () => {
    return request(app).put(`/v1/skill/${_mainData[0].skills[0].id}`)
      .send({completion_year: 2051})
      .set('authorization', `bearer ${_mainData[0].token}`)
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Completion year is not valid');
        expect(res.body).not.toHaveProperty('content')
      });
});

test('[SKILL][22] - Update with a start date greater than the completion date', () => {
    return request(app).put(`/v1/skill/${_mainData[0].skills[0].id}`)
      .send({start_year: new Date().getFullYear(),completion_year: new Date(faker.date.past(faker.random.numeric())).getFullYear(),})
      .set('authorization', `bearer ${_mainData[0].token}`)
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Start year greater than completion year');
        expect(res.body).not.toHaveProperty('content')
      });
});

test('[SKILL][23] - Update with a start date later than the previously saved finish date', () => {
    return request(app).put(`/v1/skill/${_mainData[0].skills[0].id}`)
      .send({start_year: new Date().getFullYear()})
      .set('authorization', `bearer ${_mainData[0].token}`)
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Start year greater than completion year');
        expect(res.body).not.toHaveProperty('content')
      });
});

test('[SKILL][24] - Update with extra attributes', () => {
    return request(app).put(`/v1/skill/${_mainData[0].skills[0].id}`)
      .send({test:'test'})
      .set('authorization', `bearer ${_mainData[0].token}`)
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Invalid parameter received');
        expect(res.body).not.toHaveProperty('content')
      });
});

test('[SKILL][25] - Delete skill with all correct parameters', () => {
    return request(app).delete(`/v1/skill/${_mainData[0].skills[0].id}`)
      .send()
      .set('authorization', `bearer ${_mainData[0].token}`)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Skill Deleted Successfully');
      });
});

test('[SKILL][26] - Delete skill with invalid id (letters)', () => {
    return request(app).put(`/v1/skill/abc`)
      .send()
      .set('authorization', `bearer ${_mainData[0].token}`)
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Invalid ID');
      });
});

test('[SKILL][27] - Delete skill with invalid id (length)', () => {
    return request(app).put(`/v1/skill/9999999999`)
      .send()
      .set('authorization', `bearer ${_mainData[0].token}`)
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Invalid ID');
      });
});

test('[SKILL][28] - Delete skill with an incorrect id', () => {
    return request(app).put(`/v1/skill/999999999`)
      .send()
      .set('authorization', `bearer ${_mainData[0].token}`)
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Incorrect id or without permission');
      });
});

test('[SKILL][29] - Delete another user\'s skill', () => {
    return request(app).put(`/v1/skill/${_mainData[0].skills[0].id}`)
      .send()
      .set('authorization', `bearer ${_mainData[1].token}`)
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Incorrect id or without permission');
      });
});