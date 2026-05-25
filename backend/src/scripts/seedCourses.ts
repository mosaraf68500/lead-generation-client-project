/**
 * Idempotent course seed.
 *
 * Inserts two courses per category (14 total) covering every category that
 * appears in the marketing UI (navbar mega-menu + course list filters):
 *   Business, Design, Engineering, Marketing, No-Code, Productivity, Finance.
 *
 * Each seeded course is uniquely identified by its `slug`, so re-running the
 * script is safe — existing rows are updated in place (`upsert`) rather than
 * duplicated. Admins / staff can edit, publish-toggle, or delete any of them
 * from the admin dashboard at /admin/courses.
 *
 * Run with:
 *
 *     npm run seed:courses
 *
 * Prerequisites:
 *   - `npm run seed` has been run at least once so that `admin@gmail.com`
 *     exists. That user is used as the `instructor` ObjectId for every
 *     seeded course (the field is `required` on the model).
 */

import mongoose from 'mongoose';
import slugify from 'slugify';
import { connectDatabase } from '../config/db';
import { CourseModel } from '../modules/course/course.model';
import { UserModel } from '../modules/user/user.model';
import { logger } from '../utils/logger';
import type { CourseLevel } from '../modules/course/course.interface';

// --- Shared assets ------------------------------------------------------
//
// Each category gets a deterministic thumbnail from Unsplash so the cards
// look reasonable in dev without any media upload step.

const THUMBNAILS: Record<string, string> = {
  Business: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80',
  // Previous URL (photo-1561070791-2526d30994b8) was removed by Unsplash and
  // returned a 404 to next/image's optimiser, breaking course thumbnails for
  // every Design course. Replacement is a verified-live Figma/UI workspace shot.
  Design: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&w=1200&q=80',
  Engineering: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
  Marketing: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?auto=format&fit=crop&w=1200&q=80',
  'No-Code': 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&q=80',
  Productivity: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
  Finance: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80',
};

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
}

const SEED_COURSES: SeedCourseSpec[] = [
  // ---- Business ------------------------------------------------------
  {
    title: 'Modern Business Strategy Bootcamp',
    shortDescription:
      'Build a 90-day go-to-market plan with frameworks used by top growth teams.',
    description:
      'A hands-on bootcamp covering market sizing, positioning, OKR planning, sales motions, and unit economics. Includes case studies, downloadable templates, and live exercises designed to give you a complete business playbook you can apply immediately.',
    category: 'Business',
    level: 'beginner',
    price: 199,
    discountPrice: 129,
    durationHours: 14,
    tags: ['strategy', 'gtm', 'okr', 'growth'],
  },
  {
    title: 'Startup Operations & Scaling Playbook',
    shortDescription:
      'Operational systems, hiring loops, and SOPs used by venture-backed startups.',
    description:
      'Learn how to operationalise a growing startup: hiring rubrics, runbooks, decision logs, vendor selection, and lightweight finance ops. Includes 40+ downloadable SOP templates and a 6-week implementation plan.',
    category: 'Business',
    level: 'intermediate',
    price: 249,
    durationHours: 18,
    tags: ['operations', 'startup', 'scaling', 'leadership'],
  },

  // ---- Design --------------------------------------------------------
  {
    title: 'UI/UX Foundations with Figma',
    shortDescription:
      'Design clean, accessible product UIs from the very first wireframe.',
    description:
      'Start from typography and grid systems, move into wireframing, component libraries, and prototyping in Figma. By the end of the course you will ship a polished mobile + web case study to your portfolio.',
    category: 'Design',
    level: 'beginner',
    price: 149,
    discountPrice: 99,
    durationHours: 12,
    tags: ['figma', 'ui', 'ux', 'portfolio'],
  },
  {
    title: 'Advanced Product Design Systems',
    shortDescription:
      'Build a token-based, multi-brand design system that scales across teams.',
    description:
      'Cover design tokens, component API contracts, theming, accessibility audits, and Figma library governance. Includes a working Figma + code design system you can fork into your own project.',
    category: 'Design',
    level: 'advanced',
    price: 299,
    durationHours: 22,
    tags: ['design-system', 'figma', 'tokens', 'accessibility'],
  },

  // ---- Engineering ---------------------------------------------------
  {
    title: 'Full-Stack TypeScript with Next.js',
    shortDescription:
      'Ship a production-grade Next.js + Node.js + MongoDB app from scratch.',
    description:
      'Build a real product end-to-end: authentication, role-based access, file uploads, server actions, search, dashboards, and deployment. Strict TypeScript and clean architecture throughout.',
    category: 'Engineering',
    level: 'intermediate',
    price: 279,
    discountPrice: 199,
    durationHours: 24,
    tags: ['nextjs', 'typescript', 'mongodb', 'fullstack'],
  },
  {
    title: 'Backend System Design Masterclass',
    shortDescription:
      'Design scalable APIs, queues, caching, and database architectures.',
    description:
      'Deep-dive into rate limiting, idempotency, queues, sharding, and event-driven architectures. Includes whiteboard interview drills and reference diagrams for 12 real-world systems.',
    category: 'Engineering',
    level: 'advanced',
    price: 349,
    durationHours: 28,
    tags: ['system-design', 'backend', 'architecture', 'interviews'],
  },

  // ---- Marketing -----------------------------------------------------
  {
    title: 'Performance Marketing Essentials',
    shortDescription:
      'Run profitable Meta and Google ad campaigns with a clear measurement stack.',
    description:
      'Covers audience research, creative testing, conversion tracking, attribution, and budget pacing. Includes spreadsheet templates and a 30-day campaign blueprint.',
    category: 'Marketing',
    level: 'beginner',
    price: 179,
    discountPrice: 119,
    durationHours: 10,
    tags: ['ads', 'meta', 'google-ads', 'analytics'],
  },
  {
    title: 'Content & SEO Growth Engine',
    shortDescription:
      'Build a content engine that compounds organic traffic month after month.',
    description:
      'Plan topic clusters, build briefs, do on-page SEO, and measure topical authority. Covers AI-assisted research workflows and a 90-day publishing cadence.',
    category: 'Marketing',
    level: 'intermediate',
    price: 219,
    durationHours: 16,
    tags: ['seo', 'content', 'organic-growth'],
  },

  // ---- No-Code -------------------------------------------------------
  {
    title: 'No-Code MVPs with Webflow & Airtable',
    shortDescription:
      'Ship a working MVP in 2 weeks — no engineering team required.',
    description:
      'Plan, build, and launch a no-code product using Webflow, Airtable, Zapier, and Stripe. Includes UX patterns, automation recipes, and a launch checklist.',
    category: 'No-Code',
    level: 'beginner',
    price: 159,
    discountPrice: 99,
    durationHours: 11,
    tags: ['no-code', 'webflow', 'airtable', 'mvp'],
  },
  {
    title: 'Internal Tools with No-Code',
    shortDescription:
      'Replace 10+ spreadsheets with secure, role-aware internal dashboards.',
    description:
      'Build approvals, CRMs, and dashboards with no-code platforms while keeping data integrity, RBAC, and audit logs. Includes 12 production-ready templates.',
    category: 'No-Code',
    level: 'intermediate',
    price: 229,
    durationHours: 14,
    tags: ['no-code', 'internal-tools', 'automation'],
  },

  // ---- Productivity --------------------------------------------------
  {
    title: 'Deep Work & Focus Systems',
    shortDescription:
      'Cut distractions and reclaim 10+ hours per week with a calm, focused workflow.',
    description:
      'Combines time blocking, energy management, attention residue research, and tool-agnostic systems. Includes a 30-day implementation plan and weekly review templates.',
    category: 'Productivity',
    level: 'beginner',
    price: 89,
    discountPrice: 59,
    durationHours: 6,
    tags: ['focus', 'time-management', 'habits'],
  },
  {
    title: 'PARA & Second Brain for Knowledge Workers',
    shortDescription:
      'Organise notes, projects, and resources so you never lose an idea again.',
    description:
      'Apply the PARA method end-to-end in Notion, Obsidian, or any modern tool. Covers capture, weekly review, and a personal CRM workflow that compounds over years.',
    category: 'Productivity',
    level: 'intermediate',
    price: 139,
    durationHours: 9,
    tags: ['notion', 'obsidian', 'pkm', 'second-brain'],
  },

  // ---- Finance -------------------------------------------------------
  {
    title: 'Personal Finance & Wealth Foundations',
    shortDescription:
      'Master budgeting, emergency funds, and your first index-fund portfolio.',
    description:
      'A judgement-free, math-first walkthrough of personal finance: cashflow, debt strategy, tax-advantaged accounts, and a passive long-term investment plan.',
    category: 'Finance',
    level: 'beginner',
    price: 119,
    discountPrice: 79,
    durationHours: 8,
    tags: ['finance', 'investing', 'budgeting'],
  },
  {
    title: 'Financial Modelling & Valuation',
    shortDescription:
      'Build investor-grade models for SaaS, marketplace, and e-commerce companies.',
    description:
      'Three end-to-end models with cohort analysis, sensitivity tables, and DCF valuations. Includes the spreadsheet templates and a peer review playbook.',
    category: 'Finance',
    level: 'advanced',
    price: 299,
    durationHours: 20,
    tags: ['modelling', 'valuation', 'saas', 'excel'],
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
  const thumbnailUrl = THUMBNAILS[spec.category] ?? THUMBNAILS.Business;

  const payload = {
    ...spec,
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

  // `.create()` triggers the pre-save hook; explicit slug short-circuits it.
  await CourseModel.create(payload);
  return 'created';
};

const main = async (): Promise<void> => {
  await connectDatabase();

  // We attach every seeded course to the admin account so the admin
  // dashboard's "instructor" join always resolves to a known name. If the
  // admin user is missing, fall back to any privileged account.
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

  let created = 0;
  let updated = 0;
  for (const spec of SEED_COURSES) {
    const result = await upsertCourse(spec, instructor._id as mongoose.Types.ObjectId);
    if (result === 'created') created += 1;
    else updated += 1;
    logger.info({ title: spec.title, category: spec.category, result }, 'Course seeded');
  }

  logger.info(
    { total: SEED_COURSES.length, created, updated },
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
