const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../../src/models/user');

const userOneId = new mongoose.Types.ObjectId();
const userOne = {
    _id: userOneId,
    name: 'Mahmut',
    email: 'mahmut@example.com',
    password: '23kotraj!@',
    tokens: [{
        token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
    }]
}

const setupDatabase = async () => {
    await User.deleteMany()
    await new User(userOne).save()
}

const closeConnection = async () => {
    await mongoose.connection.close();
}

module.exports = {
    userOneId,
    userOne,
    setupDatabase,
    closeConnection
}