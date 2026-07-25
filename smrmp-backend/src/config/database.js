const { Sequelize } = require('sequelize');
const { resolveDbEnv, useSsl } = require('./dbEnv');

const db = resolveDbEnv();
const sslEnabled = useSsl();

const dialectOptions = sslEnabled
  ? {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    }
  : {};

const sequelize = new Sequelize(db.database, db.username, db.password, {
  host: db.host,
  port: db.port,
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  dialectOptions,
  pool: {
    max: 10,
    // Keep one warm connection so the first login after idle isn't a cold SSL open.
    min: 1,
    acquire: 30000,
    idle: 30000,
  },
});

module.exports = sequelize;
