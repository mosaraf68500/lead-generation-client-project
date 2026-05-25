/**
 * Auth-related services. Sign-in / sign-up / sign-out themselves are served
 * by the mounted Better Auth handler, so the work here is limited to:
 *   - enriching a session with our profile fields, and
 *   - the "create-from-lead" helper that auto-provisions a student account
 *     when a public lead form is submitted.
 */
import crypto from 'node:crypto';
import { auth } from '../../config/auth';
import { UserModel } from '../user/user.model';
import { AppError } from '../../utils/AppError';
import { logger } from '../../utils/logger';

const getEnrichedProfile = async (userId: string) => {
  const user = await UserModel.findById(userId).lean();
  if (!user) throw new AppError('User profile not found', 404);
  return user;
};

/**
 * Generate a short, URL-safe random password used when we auto-provision a
 * student account on lead submission. The user never sees this password — the
 * frontend signs them in transparently with it once and then they can reset
 * it from their dashboard's profile page.
 */
const generatePassword = (): string =>
  // 16 hex chars + 'A1!' suffix → satisfies any reasonable complexity rule
  // while staying under Better Auth's defaults.
  `${crypto.randomBytes(8).toString('hex')}A1!`;

export interface EnsureStudentFromLeadInput {
  name: string;
  email: string;
  phone?: string;
}

export interface EnsureStudentFromLeadResult {
  userId: string;
  /** True if we just created the account (caller may want to auto-sign-in). */
  created: boolean;
  /**
   * One-time password the frontend can use to sign the user in immediately
   * after a successful lead submission. Only present when `created === true`.
   * Never persisted on the response anywhere else.
   */
  password?: string;
}

/**
 * Idempotently ensure a `student` user exists for the given email. If they
 * already exist we just return their id; if not we provision them through
 * Better Auth (same flow as the seed script at `scripts/seed.ts`) and patch
 * the `phone` + `role` fields directly on the Mongo document.
 */
const ensureStudentFromLead = async (
  input: EnsureStudentFromLeadInput,
): Promise<EnsureStudentFromLeadResult> => {
  const email = input.email.toLowerCase();
  const existing = await UserModel.findOne({ email }).select('_id').lean();
  if (existing) {
    return { userId: String(existing._id), created: false };
  }

  const password = generatePassword();
  try {
    await auth.api.signUpEmail({
      body: {
        name: input.name,
        email,
        password,
      },
    });
  } catch (err) {
    // If the sign-up failed because the user concurrently exists (e.g. a
    // duplicate submission), treat it as success.
    const fallback = await UserModel.findOne({ email }).select('_id').lean();
    if (fallback) {
      return { userId: String(fallback._id), created: false };
    }
    logger.error({ err, email }, 'Auto-provisioning student from lead failed');
    throw new AppError('Could not create student account', 500);
  }

  // Patch the role + phone directly on the user document. `role` has
  // `input: false` in the auth config so we cannot set it via signUpEmail.
  await UserModel.updateOne(
    { email },
    {
      $set: {
        role: 'student',
        emailVerified: true,
        ...(input.phone ? { phone: input.phone } : {}),
      },
    },
  );

  const created = await UserModel.findOne({ email }).select('_id').lean();
  if (!created) {
    throw new AppError('Newly created student could not be loaded', 500);
  }

  logger.info({ email }, 'Auto-provisioned student account from lead');
  return { userId: String(created._id), created: true, password };
};

export const AuthService = { getEnrichedProfile, ensureStudentFromLead };
