const express = require('express');
const cors = require('cors');
require('./db/mongoose');
const swaggerUi = require('swagger-ui-express');
// const swaggerDocument = require('./swagger.json');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const app = express()
app.use(express.json());
app.use(cors());
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(userRouter);
app.use(taskRouter);

module.exports = app;