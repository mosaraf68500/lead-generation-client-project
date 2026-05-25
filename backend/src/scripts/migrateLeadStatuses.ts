/**
 * One-off migration: remap the old lead-status vocabulary to the new one.
 *
 *   qualified   →  in_progress
 *   converted   →  enrolled
 *   rejected    →  junk
 *
 * Safe to re-run: the queries are idempotent (no-op if nothing matches).
 *
 * Run with:
 *     npm run migrate:lead-statuses
 */
import mongoose from 'mongoose';
import { connectDatabase } from '../config/db';
import { LeadModel } from '../modules/lead/lead.model';
import { logger } from '../utils/logger';

const MAPPINGS: Array<{ from: string; to: string }> = [
  { from: 'qualified', to: 'in_progress' },
  { from: 'converted', to: 'enrolled' },
  { from: 'rejected', to: 'junk' },
];

const main = async (): Promise<void> => {
  await connectDatabase();

  for (const { from, to } of MAPPINGS) {
    // We use updateMany on the raw collection because Mongoose's enum
    // validator (now scoped to the NEW values) would reject any save against
    // the legacy values. `updateMany` with `$set` bypasses validators by
    // default which is exactly what we need for a migration.
    const result = await LeadModel.collection.updateMany(
      { status: from },
      { $set: { status: to } },
    );
    logger.info({ from, to, matched: result.matchedCount, modified: result.modifiedCount }, 'Status mapped');
  }

  logger.info('Lead status migration complete.');
};

main()
  .catch((err) => {
    logger.error({ err }, 'Lead status migration failed');
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => undefined);
    process.exit(process.exitCode ?? 0);
  });
