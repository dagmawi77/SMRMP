require('dotenv').config({ override: true });

const { validateEnv } = require('./src/config/environment');
const app = require('./src/app');
const { sequelize } = require('./src/models');
const start = async () => {
  try {
    validateEnv();
    await sequelize.authenticate();
    console.log('Database connection established');

    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`SMRMP API listening on port ${PORT}`);
    });

    const shutdown = async (signal) => {
      console.log(`${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        await sequelize.close();
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

start();
