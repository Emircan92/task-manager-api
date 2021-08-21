const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const User = require('../src/models/user');

const userOne = {
    name: 'Mahmut',
    email: 'mahmut@example.com',
    password: '23kotraj!@'
}

beforeEach(async () => {
    await User.deleteMany()
    await new User(userOne).save()
})

afterAll(async () => {
    await mongoose.connection.close();
})

test('Should signup a new user', async () => {
    await request(app).post('/users').send({
        name: 'Emircan',
        email: 'Emircan123@example.com',
        password: 'MyPass7777!'
    }).expect(201);
})

test('Should login existing user', async () => {
    await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200);
})

test('Should not login nonexistent user', async () => {
    await request(app).post('/users/login').send({
        email: 'nonExistentUser@example.com',
        password: 'nonExistentUserPw123!@#'
    }).expect(400);
})