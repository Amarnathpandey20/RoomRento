const app = require('./app');
const env = require('./config/env');
const { connectDB, disconnectDB } = require('./config/db');
const { logger } = require('./config/logger');

// Catch uncaught synchronous exceptions
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`, { stack: err.stack });
  process.exit(1);
});

let server;

const startServer = async () => {
  try {
    // 1. Establish database connection
    await connectDB();

    // 2. Start Express HTTP server
    server = app.listen(env.PORT, () => {
      logger.info(`=======================================================`);
      logger.info(` Room Rento API Server running in [${env.NODE_ENV}] mode`);
      logger.info(` Port: http://localhost:${env.PORT}`);
      logger.info(` API Documentation: http://localhost:${env.PORT}/api/docs`);
      logger.info(` Health Check: http://localhost:${env.PORT}/api/v1/health`);
      logger.info(`=======================================================`);
    });
  } catch (error) {
    logger.error(`Failed to boot server: ${error.message}`);
    process.exit(1);
  }
};

// Catch unhandled asynchronous promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Promise Rejection: ${err.message}`, { stack: err.stack });
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

// Graceful shutdown on termination signals
const handleGracefulShutdown = async (signal) => {
  logger.info(`${signal} signal received. Initiating graceful shutdown...`);
  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed.');
      await disconnectDB();
      process.exit(0);
    });
  } else {
    await disconnectDB();
    process.exit(0);
  }
};

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

startServer();
