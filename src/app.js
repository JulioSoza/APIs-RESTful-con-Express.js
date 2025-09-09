
const express = require('express');
const usersRouter = require('./routes/users.routes');

const app = express();

// Habilitar JSON en requests
app.use(express.json());

// Rutas
app.use('/api/users', usersRouter);

module.exports = app;
