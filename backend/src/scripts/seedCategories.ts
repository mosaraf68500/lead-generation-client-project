/**
 * Idempotent category seed. Backfills the `categories` collection from the
 * distinct category strings already present on existing courses (so that
 * the dashboard's Category manager has something to display on first run).
 *
 * Re-running is safe: each row is upserted by name.
 *
 * Run with:
 *
 *     npm run seed:categories
 */

import mongoose from 'mongoose';
import slugify from 'slugify';
import { connectDatabase } from '../config/db';
import { CategoryModel } from '../modules/category/category.model';
import { CourseModel } from '../modules/course/course.model';
import { logger } from '../utils/logger';

// Fallback list — used when there are no courses yet so the dashboard isn't
// staring at an empty taxonomy on a fresh install.
const DEFAULTS = [
  'Business',
  'Design',
  'Engineering',
  'Finance',
  'Marketing',
  'No-Code',
  'Productivity',
];

const ICON_KEYS: Record<string, string> = {
  Business: 'briefcase',
  Design: 'palette',
  Engineering: 'cpu',
  Finance: 'banknote',
  Marketing: 'megaphone',
  'No-Code': 'blocks',
  Productivity: 'sparkles',
};

const DESCRIPTIONS: Record<string, string> = {
  Business: 'Strategy, operations, and leadership tracks for ambitious builders.',
  Design: 'Visual design, UX, and product-craft programmes.',
  Engineering: 'Software engineering, systems, and full-stack development.',
  Finance: 'Personal finance, investing, and corporate finance fundamentals.',
  Marketing: 'Growth marketing, content, and performance campaigns.',
  'No-Code': 'Build production tools without writing code.',
  Productivity: 'Workflow systems, automation, and focus techniques.',
};

const runSeed = async (): Promise<void> => {
  await connectDatabase();
  logger.info('🌱 Seeding categories…');

  const distinctFromCourses: string[] = await CourseModel.distinct('category');
  const merged = Array.from(
    new Set([...DEFAULTS, ...distinctFromCourses.filter((c): c is string => Boolean(c))]),
  ).sort();

  let created = 0;
  let updated = 0;

  for (const [index, name] of merged.entries()) {
    const slug = slugify(name, { lower: true, strict: true, trim: true });
    const existing = await CategoryModel.findOne({ name });
    if (existing) {
      // Only fill in metadata that's still missing — never clobber edits.
      let changed = false;
      if (!existing.description && DESCRIPTIONS[name]) {
        existing.description = DESCRIPTIONS[name];
        changed = true;
      }
      if (!existing.iconKey && ICON_KEYS[name]) {
        existing.iconKey = ICON_KEYS[name];
        changed = true;
      }
      if (existing.sortOrder == null) {
        existing.sortOrder = index;
        changed = true;
      }
      if (changed) {
        await existing.save();
        updated += 1;
      }
      continue;
    }

    await CategoryModel.create({
      name,
      slug,
      description: DESCRIPTIONS[name],
      iconKey: ICON_KEYS[name],
      sortOrder: index,
      isActive: true,
    });
    created += 1;
  }

  logger.info(
    `✅ Categories seed complete · ${created} created · ${updated} updated · ${merged.length} total`,
  );
};

const main = async (): Promise<void> => {
  try {
    await runSeed();
  } catch (err) {
    logger.error({ err }, '❌ Category seed failed');
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

void main();
