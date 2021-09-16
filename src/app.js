const express = require('express');
const cors = require('cors');
require('./db/mongoose');
const swaggerUi = require('swagger-ui-express');
// const swaggerDocument = require('./swagger.json');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const app = express()
app.use(express.json());

var options = {
    "origin": "*",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": false,
    "optionsSuccessStatus": 204
  }

app.use(cors(options));

// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(userRouter);
app.use(taskRouter);

module.exports = app;