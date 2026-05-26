/**
 * Idempotent course seed — refreshed for the curated 11-course catalog.
 *
 * Catalog (in display order on the home "Popular courses" row):
 *   1. Photo Editing
 *   2. Video Editing
 *   3. Microsoft Excel
 *   4. Data Entry
 *   5. Social Marketing
 *   6. Spoken English
 *   7. Facebook Marketing
 *   8. Learn Al Quran
 *   9. Lead Generation
 *   10. Fiverr / Upwork
 *   11. YouTube Marketing
 *
 * Each spec carries its own thumbnail URL (no more category-keyed
 * lookup table) and a deterministic `enrollmentsCount` that makes the
 * `-enrollmentsCount` sort on the home page render the courses in the
 * exact order above.
 *
 * Safety:
 *   - Every seeded course tags its `thumbnail.publicId` with the
 *     prefix `seed/courses/`. The cleanup pass below uses that prefix
 *     to identify rows owned by the seeder and removes any whose slug
 *     is no longer in the curated list. Hand-added courses (created
 *     via the admin dashboard, no `seed/courses/` prefix) are never
 *     touched.
 *
 * Run:
 *
 *     npm run seed:courses
 *
 * Prerequisites:
 *   - `npm run seed` has been run at least once so that `admin@gmail.com`
 *     exists. That user is used as the `instructor` for every seeded
 *     course (required by the schema).
 */

import mongoose from 'mongoose';
import slugify from 'slugify';
import { connectDatabase } from '../config/db';
import { CourseModel } from '../modules/course/course.model';
import { UserModel } from '../modules/user/user.model';
import { logger } from '../utils/logger';
import type { CourseLevel } from '../modules/course/course.interface';

// --- Course definitions -------------------------------------------------

interface SeedCourseSpec {
  title: string;
  shortDescription: string;
  description: string;
  category: string;
  level: CourseLevel;
  price: number;
  discountPrice?: number;
  durationHours: number;
  tags: string[];
  /** Unsplash photo URL (all verified live as of seed-script update). */
  thumbnailUrl: string;
  /** Drives `-enrollmentsCount` sort order on the home page. */
  enrollmentsCount: number;
}

const SEED_COURSES: SeedCourseSpec[] = [
  {
    title: 'Photo Editing',
    shortDescription:
      'Retouch portraits, colour-grade, and composite professional photos in Photoshop and Lightroom.',
    description:
      'Master the full photo-editing pipeline — RAW workflow, skin retouching, frequency separation, dodge & burn, advanced selections, masking, colour grading, and exporting for print and web. Includes 25+ practice files and a portfolio-ready capstone.',
    category: 'Design',
    level: 'beginner',
    price: 89,
    discountPrice: 49,
    durationHours: 12,
    tags: ['photoshop', 'lightroom', 'retouching', 'colour-grading'],
    thumbnailUrl:
      'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=1200&q=80',
    enrollmentsCount: 1100,
  },
  {
    title: 'Video Editing',
    shortDescription:
      'Edit cinematic videos in Premiere Pro and DaVinci Resolve — cuts, colour, sound, export.',
    description:
      'A practical, project-led video-editing course covering Premiere Pro and DaVinci Resolve. Multi-cam editing, transitions, motion graphics with After Effects basics, audio cleanup, and colour grading. Includes raw footage so you can edit alongside every lesson.',
    category: 'Design',
    level: 'beginner',
    price: 99,
    discountPrice: 59,
    durationHours: 14,
    tags: ['premiere-pro', 'davinci-resolve', 'editing', 'colour'],
    thumbnailUrl:
      'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80',
    enrollmentsCount: 1050,
  },
  {
    title: 'Microsoft Excel',
    shortDescription:
      'Formulas, pivot tables, Power Query, and dashboards — the modern Excel from scratch.',
    description:
      'From SUM/IF basics to dynamic arrays, XLOOKUP, Power Query, and interactive dashboards. Each module ends with a real-world workbook you can adapt for finance, marketing, ops, or HR.',
    category: 'Productivity',
    level: 'beginner',
    price: 69,
    discountPrice: 39,
    durationHours: 10,
    tags: ['excel', 'pivot-tables', 'power-query', 'dashboards'],
    thumbnailUrl:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    enrollmentsCount: 1000,
  },
  {
    title: 'Data Entry',
    shortDescription:
      'Fast, accurate data entry workflows for spreadsheets, CRMs, and admin platforms.',
    description:
      'Become a high-output data entry professional: typing speed drills, keyboard shortcuts, copy-paste hygiene, validation, deduplication, and basic Excel formulas. Includes 10 mock client briefs.',
    category: 'Productivity',
    level: 'beginner',
    price: 49,
    discountPrice: 29,
    durationHours: 6,
    tags: ['data-entry', 'excel', 'crm', 'admin'],
    thumbnailUrl:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    enrollmentsCount: 950,
  },
  {
    title: 'Social Marketing',
    shortDescription:
      'Plan, create, and grow audiences across Instagram, TikTok, and LinkedIn.',
    description:
      'A complete social media marketing playbook: content pillars, hook writing, short-form video, analytics, and creator outreach. Includes 30-day calendars and platform-specific templates.',
    category: 'Marketing',
    level: 'beginner',
    price: 89,
    discountPrice: 59,
    durationHours: 11,
    tags: ['social-media', 'instagram', 'tiktok', 'content'],
    thumbnailUrl:
      'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=1200&q=80',
    enrollmentsCount: 900,
  },
  {
    title: 'Spoken English',
    shortDescription:
      'Speak fluent, confident English for daily life, the workplace, and interviews.',
    description:
      'Build daily speaking habits, master pronunciation, and learn the everyday phrasing native speakers actually use. Includes shadowing drills, interview simulators, and weekly speaking challenges.',
    category: 'Personal Growth',
    level: 'beginner',
    price: 59,
    discountPrice: 35,
    durationHours: 9,
    tags: ['english', 'speaking', 'pronunciation', 'interviews'],
    thumbnailUrl:
      'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=1200&q=80',
    enrollmentsCount: 850,
  },
  {
    title: 'Facebook Marketing',
    shortDescription:
      'Run profitable Facebook & Instagram ad campaigns with confident targeting and creatives.',
    description:
      'A modern Meta Ads course — Pixel + Conversions API setup, audience building, creative testing matrices, budget pacing, scaling, and reporting. Includes a 30-day ad-launch blueprint.',
    category: 'Marketing',
    level: 'intermediate',
    price: 119,
    discountPrice: 79,
    durationHours: 12,
    tags: ['facebook-ads', 'meta', 'instagram-ads', 'performance'],
    thumbnailUrl:
      'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?auto=format&fit=crop&w=1200&q=80',
    enrollmentsCount: 800,
  },
  {
    title: 'Learn Al Quran',
    shortDescription:
      'Recite the Quran with proper Tajweed — from Arabic alphabet to Surah practice.',
    description:
      'A structured Tajweed journey: letters, vowels, makhraj, common rules, and recitation practice across short Surahs. Lessons are slow, repeatable, and beginner-friendly.',
    category: 'Personal Growth',
    level: 'beginner',
    price: 39,
    discountPrice: 19,
    durationHours: 16,
    tags: ['quran', 'tajweed', 'arabic', 'recitation'],
    thumbnailUrl:
      'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=1200&q=80',
    enrollmentsCount: 750,
  },
  {
    title: 'Lead Generation',
    shortDescription:
      'Build lead lists, write outbound emails, and convert prospects — for clients or your own SaaS.',
    description:
      'Source verified leads with Apollo / LinkedIn Sales Navigator, build ICP-aligned lists, write outbound emails that book meetings, and track replies in a clean CRM. Includes 5 niche-ready templates.',
    category: 'Marketing',
    level: 'intermediate',
    price: 129,
    discountPrice: 89,
    durationHours: 13,
    tags: ['lead-generation', 'cold-email', 'apollo', 'b2b'],
    thumbnailUrl:
      'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&q=80',
    enrollmentsCount: 700,
  },
  {
    title: 'Fiverr / Upwork',
    shortDescription:
      'Win freelance clients on Fiverr and Upwork — gigs, proposals, ranking, retention.',
    description:
      'Set up Fiverr gigs that rank, write Upwork proposals that get replies, deliver client work professionally, and turn one-off jobs into recurring retainers. Includes proposal templates and pricing playbooks.',
    category: 'Business',
    level: 'beginner',
    price: 79,
    discountPrice: 49,
    durationHours: 10,
    tags: ['fiverr', 'upwork', 'freelancing', 'proposals'],
    thumbnailUrl:
      'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=80',
    enrollmentsCount: 650,
  },
  {
    title: 'YouTube Marketing',
    shortDescription:
      'Grow a YouTube channel from zero — niche, packaging, scripting, retention, monetisation.',
    description:
      'A complete YouTube growth course: niche selection, title & thumbnail testing, scripting for retention, idea pipelines, analytics, and monetisation. Includes a 90-day publishing calendar.',
    category: 'Marketing',
    level: 'intermediate',
    price: 109,
    discountPrice: 69,
    durationHours: 12,
    tags: ['youtube', 'creator-economy', 'monetisation', 'video'],
    thumbnailUrl:
      'https://images.unsplash.com/photo-1611162616475-46b635cb6868?auto=format&fit=crop&w=1200&q=80',
    enrollmentsCount: 600,
  },
];

// --- Seed runner --------------------------------------------------------

const toSlug = (title: string): string =>
  slugify(title, { lower: true, strict: true, trim: true });

const upsertCourse = async (
  spec: SeedCourseSpec,
  instructorId: mongoose.Types.ObjectId,
): Promise<'created' | 'updated'> => {
  const slug = toSlug(spec.title);
  const { thumbnailUrl, ...rest } = spec;

  const payload = {
    ...rest,
    slug,
    instructor: instructorId,
    isPublished: true,
    thumbnail: {
      url: thumbnailUrl,
      publicId: `seed/courses/${slug}`,
    },
  };

  const existing = await CourseModel.findOne({ slug }).select('_id').lean();

  if (existing) {
    await CourseModel.updateOne({ slug }, { $set: payload });
    return 'updated';
  }

  await CourseModel.create(payload);
  return 'created';
};

/**
 * Remove any course that was previously created by THIS seeder
 * (identified by the `seed/courses/` publicId prefix) but is no longer
 * part of the curated catalog. Hand-added courses are left alone.
 */
const cleanupStaleSeeds = async (currentSlugs: string[]): Promise<number> => {
  const result = await CourseModel.deleteMany({
    'thumbnail.publicId': { $regex: /^seed\/courses\// },
    slug: { $nin: currentSlugs },
  });
  return result.deletedCount ?? 0;
};

const main = async (): Promise<void> => {
  await connectDatabase();

  // We attach every seeded course to the admin account so the admin
  // dashboard's "instructor" join always resolves to a known name.
  const instructor =
    (await UserModel.findOne({ email: 'admin@gmail.com' }).select('_id').lean()) ??
    (await UserModel.findOne({ role: { $in: ['admin', 'super_admin', 'staff'] } })
      .select('_id')
      .lean());

  if (!instructor) {
    throw new Error(
      'No admin/staff user found. Run `npm run seed` first to create the system accounts.',
    );
  }

  const currentSlugs = SEED_COURSES.map((c) => toSlug(c.title));

  // Step 1 — purge any orphaned previously-seeded courses (e.g. the
  // legacy 14-course generic catalog this seed script used to ship).
  const removed = await cleanupStaleSeeds(currentSlugs);
  if (removed > 0) {
    logger.info({ removed }, 'Removed stale seeded courses');
  }

  // Step 2 — upsert each course in the curated catalog.
  let created = 0;
  let updated = 0;
  for (const spec of SEED_COURSES) {
    const result = await upsertCourse(spec, instructor._id as mongoose.Types.ObjectId);
    if (result === 'created') created += 1;
    else updated += 1;
    logger.info({ title: spec.title, result }, 'Course seeded');
  }

  logger.info(
    { total: SEED_COURSES.length, created, updated, removed },
    'Course seed complete.',
  );
};

main()
  .catch((err) => {
    logger.error({ err }, 'Course seed failed');
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => undefined);
    process.exit(process.exitCode ?? 0);
  });
