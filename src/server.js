const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(express.json());

const usersRouter = require('./routes/users.routes');

// prefijo: /api
app.use('/api', usersRouter);

app.listen(process.env.PORT || 3000, () => {
  console.log('API escuchando en http://localhost:3000');
});
