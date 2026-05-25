/**
 * Server-side Better Auth instance for the Next.js app. Mirrors the backend
 * config so any session issued here is honoured by the Express API and
 * vice versa.
 */
import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { bearer } from 'better-auth/plugins';
import { MongoClient, type Db } from 'mongodb';

const required = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
};

const mongoUri = required('MONGODB_URI');
const secret = required('BETTER_AUTH_SECRET');
const baseURL = process.env.BETTER_AUTH_URL ?? 'http://localhost:3000';

// Cache the connection across hot reloads in development.
const globalForMongo = globalThis as unknown as { __mongoClient?: MongoClient };
const client = globalForMongo.__mongoClient ?? new MongoClient(mongoUri);
if (!globalForMongo.__mongoClient) {
  globalForMongo.__mongoClient = client;
  client.connect().catch(() => undefined);
}
const db: Db = client.db();

export const auth = betterAuth({
  appName: 'Smart Earning Pro',
  secret,
  baseURL,
  database: mongodbAdapter(db),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 6,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'student',
        input: false,
      },
      phone: { type: 'string', required: false },
      avatar: { type: 'string', required: false },
      bio: { type: 'string', required: false },
      country: { type: 'string', required: false },
    },
  },
  plugins: [bearer()],
  trustedOrigins: [baseURL],
});

export type Auth = typeof auth;
