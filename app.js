const express = require('express');
const logger = require('morgan');
const cors = require('cors');


const contactsRouter = require('./Contats/routers.js');
const authRouter = require('./Auth/routers.js');
const fileRouter = require('./Files/routers.js');

const app = express();

const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short';

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());

app.use('/api/contacts', contactsRouter);
app.use('/users', authRouter);
app.use('/files', fileRouter);

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

module.exports = app;
