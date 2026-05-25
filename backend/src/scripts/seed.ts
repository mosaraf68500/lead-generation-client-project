/**
 * Idempotent seed script.
 *
 * Creates the three fixed system accounts (super admin / admin / staff) the
 * platform needs in development. Run with:
 *
 *     npm run seed
 *
 * What it does:
 *   1. Connect Mongoose (for the User model patch) AND the Better Auth
 *      native MongoClient (for sign-up).
 *   2. For each seed user:
 *        - If they don't exist yet, call `auth.api.signUpEmail` so a real
 *          credential row is created the same way a self-registered user
 *          would be (hashed password, account row, etc.).
 *        - Then patch `role` directly on the Mongo `user` document to give
 *          them the privileged role. This is safe because `role` is set as
 *          `input: false` on Better Auth's `additionalFields`, so clients
 *          can't escalate themselves to admin via the API.
 *   3. Exit cleanly.
 *
 * The script is safe to run repeatedly: existing users are detected via the
 * unique `email` index and only their role is reconciled.
 */
import mongoose from 'mongoose';
import { auth, connectAuthDatabase } from '../config/auth';
import { connectDatabase } from '../config/db';
import { UserModel } from '../modules/user/user.model';
import { logger } from '../utils/logger';
import type { UserRole } from '../types/common.types';

interface SeedSpec {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

const SEED_USERS: SeedSpec[] = [
  {
    name: 'Super Admin',
    email: 'supper@gmail.com',
    password: 'supper123',
    role: 'super_admin',
  },
  {
    name: 'Platform Admin',
    email: 'admin@gmail.com',
    password: 'admin123',
    role: 'admin',
  },
  {
    name: 'Staff Member',
    email: 'staff@gmail.com',
    password: 'staff123',
    role: 'staff',
  },
];

const ensureUser = async (spec: SeedSpec): Promise<void> => {
  const existing = await UserModel.findOne({ email: spec.email.toLowerCase() }).lean();

  if (!existing) {
    try {
      await auth.api.signUpEmail({
        body: {
          name: spec.name,
          email: spec.email,
          password: spec.password,
        },
      });
      logger.info({ email: spec.email }, 'Created seed account');
    } catch (err) {
      logger.error({ err, email: spec.email }, 'Sign-up failed during seed');
      throw err;
    }
  } else {
    logger.info({ email: spec.email }, 'Seed account already exists');
  }

  // Always reconcile the role so a manually-edited document or a previously
  // seeded student-defaulted document is brought back in line.
  const update = await UserModel.updateOne(
    { email: spec.email.toLowerCase() },
    { $set: { role: spec.role, name: spec.name, emailVerified: true } },
  );

  logger.info(
    { email: spec.email, role: spec.role, matched: update.matchedCount, modified: update.modifiedCount },
    'Role reconciled',
  );
};

const main = async (): Promise<void> => {
  await Promise.all([connectDatabase(), connectAuthDatabase()]);

  for (const spec of SEED_USERS) {
    await ensureUser(spec);
  }

  logger.info('Seed complete.');
};

main()
  .catch((err) => {
    logger.error({ err }, 'Seed failed');
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => undefined);
    process.exit(process.exitCode ?? 0);
  });
