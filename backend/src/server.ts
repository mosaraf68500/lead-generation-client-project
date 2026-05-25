/**
 * HTTP bootstrap: connect to MongoDB (Mongoose + Better Auth native client)
 * THEN bind the port. Adds graceful shutdown so SIGTERM is honoured cleanly
 * by container orchestrators.
 */
import http from 'node:http';
import { app } from './app';
import { env } from './config/env';
import { connectDatabase } from './config/db';
import { connectAuthDatabase } from './config/auth';
import { logger } from './utils/logger';

const start = async (): Promise<void> => {
  await Promise.all([connectDatabase(), connectAuthDatabase()]);

  const server = http.createServer(app);

  // Track whether `listening` actually fired so shutdown can avoid touching
  // a half-initialised server (which throws ERR_SERVER_NOT_RUNNING).
  let isListening = false;
  let isShuttingDown = false;

  server.on('listening', () => {
    isListening = true;
    logger.info(`Smart Earning Pro API listening on http://localhost:${env.PORT}`);
  });

  // Bind errors (EADDRINUSE, EACCES, ...) surface as a single 'error' event
  // and must be handled BEFORE Node promotes them to an uncaughtException.
  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      logger.error(
        `Port ${env.PORT} is already in use. Free it (lsof -ti:${env.PORT} | xargs kill -9) ` +
          `or set a different PORT in backend/.env.`,
      );
    } else if (err.code === 'EACCES') {
      logger.error(
        `Port ${env.PORT} requires elevated privileges. Pick a port above 1024.`,
      );
    } else {
      logger.error(err, 'HTTP server error');
    }
    process.exit(1);
  });

  server.listen(env.PORT);

  const shutdown = (signal: string): void => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    logger.info({ signal }, 'Shutting down API...');

    const finalise = (code: number) => {
      // Force-exit if anything is still hanging (open sockets, etc).
      setTimeout(() => process.exit(code), 10_000).unref();
      process.exit(code);
    };

    if (!isListening) {
      finalise(0);
      return;
    }

    server.close((err) => {
      if (err) {
        logger.error(err, 'Error during shutdown');
        return finalise(1);
      }
      finalise(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('unhandledRejection', (reason) => {
    logger.error({ reason }, 'Unhandled promise rejection');
  });
  process.on('uncaughtException', (err) => {
    logger.error(err, 'Uncaught exception');
    shutdown('uncaughtException');
  });
};

start().catch((err) => {
  logger.error(err, 'Failed to start API');
  process.exit(1);
});
