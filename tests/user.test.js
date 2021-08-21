const request = require('supertest');
const app = require('../src/app');

test('Should signup a new user', async () => {
    await request(app).post('/users').send({
        name: 'Emircan',
        email: 'Emircan123@example.com',
        password: 'MyPass7777!'
    }).expect(201)
})