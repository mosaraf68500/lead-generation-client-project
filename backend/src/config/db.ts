/**
 * Mongoose connection helper. We expose a single async `connectDatabase`
 * so the server bootstrap can `await` it before binding to the port.
 */
import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

let isConnected = false;

export const connectDatabase = async (): Promise<typeof mongoose> => {
  if (isConnected) {
    return mongoose;
  }

  mongoose.set('strictQuery', true);

  const connection = await mongoose.connect(env.MONGODB_URI, {
    // The native driver pool is more than enough for an API of this size.
    maxPoolSize: 20,
    serverSelectionTimeoutMS: 10_000,
  });

  isConnected = connection.connections[0].readyState === 1;
  logger.info({ host: connection.connection.host }, 'MongoDB connected');

  // Surface unexpected disconnects so deploys can react.
  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    logger.warn('MongoDB disconnected');
  });

  return connection;
};
