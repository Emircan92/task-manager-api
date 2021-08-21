const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');
const {
    userOneId,
    userOne,
    userTwoId,
    userTwo,
    taskOne,
    taskTwo,
    taskThree,
    setupDatabase, 
    closeConnection 
} = require('./fixtures/db');

beforeEach(setupDatabase);
afterAll(closeConnection);

test('Should signup a new user', async () => {
    const response = await request(app).post('/users').send({
        name: 'Emircan',
        email: 'emircan123@example.com',
        password: 'MyPass7777!'
    }).expect(201);

    // Assert that the database was changed correctly
    const user = await User.findById(response.body.user._id);
    expect(user).not.toBeNull()

    // Assertions about the response
    expect(response.body).toMatchObject({
        user: {
            name: 'Emircan',
            email: 'emircan123@example.com'
        },
        token: user.tokens[0].token
    })

    expect(user.password).not.toBe('MyPass7777!');
})

test('Should not signup a new user with invalid name', async () => {
    const response = await request(app)
        .post('/users')
        .send({
            name: '',
            email: 'test@example.com',
            password: 'testPw!@23'
        })
        .expect(400)
})

test('Should not signup a new user with invalid email', async () => {
    const response = await request(app)
        .post('/users')
        .send({
            name: 'testName',
            email: 'test!example.com',
            password: 'testPw!@23'
        })
        .expect(400)
})

test('Should not signup a new user with invalid password', async () => {
    const response = await request(app)
        .post('/users')
        .send({
            name: 'testName',
            email: 'test@example.com',
            password: '12'
        })
        .expect(400)
})

test('Should login existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200);

    const user = await User.findById(userOneId);
    expect(response.body.token).toBe(user.tokens[1].token);
})

test('Should not login nonexistent user', async () => {
    await request(app).post('/users/login').send({
        email: 'nonExistentUser@example.com',
        password: 'nonExistentUserPw123!@#'
    }).expect(400);
})

test('Should get profile for user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);
})

test('Should not get profile for unauthenticated user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401);
})

test('Should delete account for user', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);
    
    const user = await User.findById(userOneId);
    expect(user).toBeNull();
})

test('Should not delete account for unauthenticated user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

test('Should upload avatar image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200);

    const user = await User.findById(userOneId);
    expect(user.avatar).toEqual(expect.any(Buffer));
})

test('Should update valid user fields', async () => {
    const response = await request(app)
                        .patch('/users/me')
                        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                        .send({
                            name: 'Alican'
                        })
                        .expect(200)
    
    const user = await User.findById(userOneId);
    expect(user.name).toEqual('Alican');
})

test('Should not update invalid user fields', async () => {
    const response = await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            location: 'Alican'
        })
        .expect(400)
    
    expect(response.body._id).toBeUndefined();
})

test('Should update user', async () => {
    const response = await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send({
            name: 'changed'
        })
        .expect(200);

    const user = await User.findById(userTwoId);
    expect(user.name).toBe('changed');
})

test('Should not update user if unauthenticated', async () => {
    const response = await request(app)
        .patch('/users/me')
        .send({
            name: 'testName'
        })
        .expect(401);
    
    expect(response.body._id).toBeUndefined();
})

test('Should not update user with invalid name', async () => {
    const response = await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: ''
        })
        .expect(400)

    const user = await User.findById(userOneId);
    expect(user.name).not.toBe('');
})

test('Should not update user with invalid email', async () => {
    const response = await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            email: 'abc.com'
        })
        .expect(400)

    const user = await User.findById(userOneId);
    expect(user.email).not.toBe('abc.com');
})

test('Should not update user with invalid password', async () => {
    const response = await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            password: 'abc'
        })
        .expect(400)
})