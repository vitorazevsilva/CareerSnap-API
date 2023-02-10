const app = require('express')();
const cors = require('cors');
const consign = require('consign');
const winston = require('winston');
const { uuid } = require('uuidv4');

const knex = require('knex');
const knexfile = require('../knexfile');

const nodemailer = require('nodemailer');
const nodemailerfile = require('../nodemailer');

app.mailer = nodemailer.createTransport(nodemailerfile[process.env.NODE_ENV]);

app._frontEndUrl = 'http://127.0.0.1:5500';

app.use(cors());

app.db = knex(knexfile[process.env.NODE_ENV]);

app.log = winston.createLogger({
  level: 'debug',
  transports: [
    new winston.transports.Console({ format: winston.format.json({ space: 1 }) }),
    new winston.transports.File({
      filename: 'log/error.log',
      level: 'warn',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json({ space: 1 })),
    }),
  ],
});

consign({ cwd: 'src', verbose: false })
  .include('./config/passport.js')
  .include('./config/middlewares.js')
  .include('./services')
  .include('./routes')
  .include('./config/router.js')
  .into(app);

app.get('/', (req, res) => {
  app.log.debug('passei aqui !!!');
  res.status(200).send();
});

app.use((err, req, res, next) => {
  const { name, message, stack } = err;
  if (name === 'validationError') res.status(400).json({ error: message });
  if (name === 'forbiddenError') res.status(403).json({ error: message });
  else {
    const id = uuid();
    app.log.error(id + ': ' + name + message + stack);
    res.status(500).json({ id, error: 'Erro de sistema!' });
  }
  next(err);
});

module.exports = app;
