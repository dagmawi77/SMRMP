require('dotenv').config();

const { resolveDbEnv, useSsl } = require('./dbEnv');

const db = resolveDbEnv();
const sslOptions = useSsl()
  ? { require: true, rejectUnauthorized: false }
  : undefined;

const shared = {
  username: db.username,
  password: db.password,
  database: db.database,
  host: db.host,
  port: db.port,
  dialect: 'postgres',
  dialectOptions: sslOptions ? { ssl: sslOptions } : {},
};

module.exports = {
  development: {
    ...shared,
    logging: console.log,
  },
  test: {
    ...shared,
    database: process.env.DB_NAME_TEST || `${db.database}_test`,
    logging: false,
  },
  production: {
    ...shared,
    logging: false,
  },
};
