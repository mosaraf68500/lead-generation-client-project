/**
 * Shared Better Auth instance for the Express backend.
 *
 * The Next.js frontend hosts the Better Auth handler at `/api/auth/*`. The
 * Express API does NOT serve auth pages itself; it just needs to validate
 * the bearer token Next.js forwards on every authenticated request. By
 * pointing both runtimes at the same MongoDB database and the same
 * `BETTER_AUTH_SECRET`, sessions issued on either side are accepted on both.
 */
import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { bearer } from 'better-auth/plugins';
import { MongoClient, type Db } from 'mongodb';
import { env } from './env';
import { logger } from '../utils/logger';

// We deliberately use the native MongoDB driver here (not Mongoose) because
// the Better Auth adapter expects a raw `Db` instance. Both connections share
// the same physical database so domain models and auth tables live together.
const mongoClient = new MongoClient(env.MONGODB_URI);
let cachedDb: Db | null = null;

const getDb = (): Db => {
  if (cachedDb) return cachedDb;
  cachedDb = mongoClient.db();
  return cachedDb;
};

/** Connect the native client once; called from `server.ts` during bootstrap. */
export const connectAuthDatabase = async (): Promise<void> => {
  await mongoClient.connect();
  logger.info('Better Auth MongoDB client connected');
};

export const auth = betterAuth({
  appName: 'Smart Earning Pro',
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: env.TRUSTED_ORIGINS,
  database: mongodbAdapter(getDb()),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 6,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,
  },
  user: {
    // Profile + role fields are persisted on the Better Auth `user` document so
    // a single record powers both auth and profile concerns.
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'student',
        input: false, // Clients cannot self-assign roles during sign-up.
      },
      phone: { type: 'string', required: false },
      avatar: { type: 'string', required: false },
      bio: { type: 'string', required: false },
      country: { type: 'string', required: false },
    },
  },
  plugins: [bearer()],
});

export type Auth = typeof auth;
