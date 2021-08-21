const request = require('supertest');
const app = require('../src/app');
const Task = require('../src/models/task');
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

test('Should create task for user', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: 'From my test'
        })
        .expect(201);

    const task = await Task.findById(response.body._id);
    expect(task).not.toBeNull();
    expect(task.completed).toEqual(false);
})

test('Should not create task with invalid description', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: ''
        })
        .expect(400)
    
    expect(response.body.description).toBeUndefined();
})

test('Should not create task with invalid completed', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            completed: 5
        })
        .expect(400)
    
    expect(response.body.description).toBeUndefined();
})

test('Should update user task', async () => {
    const response = await request(app)
        .patch(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: 'changed'
        })
        .expect(200);
    
    const task = await Task.findById(taskOne._id);
    expect(task.description).toBe('changed');
})

test('Should not update user task with invalid description', async () => {
    const response = await request(app)
        .patch(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: ''
        })
        .expect(400);
    
    const task = await Task.findById(taskOne._id);
    expect(task.description).not.toBe('');
})

test('Should not update user task with invalid completed', async () => {
    const response = await request(app)
        .patch(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            completed: '123'
        })
        .expect(400);
    
    const task = await Task.findById(taskOne._id);
    expect(task.completed).not.toBe('123');
})

test('Should fetch user tasks', async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);

    expect(response.body.length).toEqual(2);
})

test('Should fetch only completed tasks', async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .query({ completed: true })
        .send()
        .expect(200);

    response.body.forEach((task) => {
        expect(task.completed).toBe(true);
    })
})

test('Should fetch only incomplete tasks', async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .query({ completed: false })
        .send()
        .expect(200);

    response.body.forEach((task) => {
        expect(task.completed).toBe(false);
    })
})

test('Should fetch user task by id', async () => {
    const response = await request(app)
        .get(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);
})

test('Should not fetch user task by id if unauthenticated', async () => {
    const response = await request(app)
        .get(`/tasks/${taskOne._id}`)
        .send()
        .expect(401);
    
    expect(response.body._id).toBeUndefined();
})

test('Should not fetch other users task by id', async () => {
    const response = await request(app)
        .get(`/tasks/${taskOne._id}`)
        .set('Authoriation', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(401);

    expect(response.body._id).toBeUndefined();
})

test('Should delete user task', async () => {
    const response = await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);

    const task = await Task.findById(taskOne._id);
    expect(task).toBeNull();
})

test('Should not delete task if unauthenticated', async () => {
    const response = await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .send()
        .expect(401)

    const task = await Task.findById(taskOne._id);
    expect(task).not.toBeNull();
})

test('Should not delete other users tasks', async () => {
    const response = await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404)

    const task = await Task.findById(taskOne._id);
    expect(task).not.toBeNull();
})

test('Should not update other users tasks', async () => {
    const response = await request(app)
        .patch(`/tasks/${taskThree._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: 'unauthorized'
        })
        .expect(404);

    const task = await Task.findById(taskThree._id);
    expect(task.description).not.toBe('unauthorized');
})

test('Should sort tasks by createdAt:desc', async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .query({ sortBy: 'createdAt:desc' })
        .send()
        .expect(200);

    expect(response.body[0].description).toBe(taskTwo.description);
})

test('Should fetch page of tasks', async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .query({ limit: 1, skip: 1 })
        .send()
        .expect(200);

    expect(response.body.length).toBe(1);
    expect(response.body[0].description).toBe(taskTwo.description);
})