import type { FilterQuery } from 'mongoose';
import slugify from 'slugify';
import { CourseModel } from './course.model';
import type { ICourse, ICourseDocument, ICourseMedia } from './course.interface';
import { AppError } from '../../utils/AppError';
import { QueryBuilder } from '../../utils/queryBuilder';
import { destroyAsset, uploadBuffer } from '../../config/cloudinary';

interface UploadedThumbnail {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
}

const uniqueSlug = async (base: string): Promise<string> => {
  const slug = slugify(base, { lower: true, strict: true, trim: true });
  let candidate = slug;
  let n = 1;
  // Loop until we find a free slot. The collision rate in practice is tiny.
  while (await CourseModel.exists({ slug: candidate })) {
    candidate = `${slug}-${n++}`;
  }
  return candidate;
};

const uploadThumbnail = async (file: UploadedThumbnail): Promise<ICourseMedia> => {
  const uploaded = await uploadBuffer(file.buffer, {
    folder: 'smart-earning-pro/courses',
    public_id: undefined,
    resource_type: 'image',
  });
  return { url: uploaded.url, publicId: uploaded.publicId };
};

const create = async (
  payload: Omit<ICourse, '_id' | 'slug' | 'thumbnail' | 'enrollmentsCount' | 'ratingAvg' | 'ratingCount' | 'createdAt' | 'updatedAt'>,
  thumbnailFile?: UploadedThumbnail,
): Promise<ICourseDocument> => {
  if (!thumbnailFile) throw new AppError('Thumbnail image is required', 400);

  const slug = await uniqueSlug(payload.title);
  const thumbnail = await uploadThumbnail(thumbnailFile);

  try {
    const created = await CourseModel.create({ ...payload, slug, thumbnail });
    return created;
  } catch (err) {
    // Best-effort rollback of the just-uploaded image if the DB write fails.
    await destroyAsset(thumbnail.publicId).catch(() => undefined);
    throw err;
  }
};

const list = async (query: Record<string, unknown>) => {
  // Default to only published courses for unauthenticated public callers.
  const builder = new QueryBuilder<ICourseDocument>(
    CourseModel.find({} as FilterQuery<ICourseDocument>).populate('instructor', 'name avatar'),
    query,
  )
    .search(['title', 'shortDescription', 'tags'])
    .filter(['category', 'level', 'isPublished'])
    .sort('-createdAt')
    .selectFields()
    .paginate();
  return builder.exec();
};

const getBySlug = async (slug: string): Promise<ICourseDocument> => {
  const course = await CourseModel.findOne({ slug }).populate('instructor', 'name avatar bio');
  if (!course) throw new AppError('Course not found', 404);
  return course;
};

const getById = async (id: string): Promise<ICourseDocument> => {
  const course = await CourseModel.findById(id);
  if (!course) throw new AppError('Course not found', 404);
  return course;
};

const update = async (
  id: string,
  payload: Partial<ICourse>,
  thumbnailFile?: UploadedThumbnail,
): Promise<ICourseDocument> => {
  const course = await getById(id);

  if (payload.title && payload.title !== course.title) {
    course.title = payload.title;
    course.slug = await uniqueSlug(payload.title);
  }

  if (thumbnailFile) {
    const previous = course.thumbnail?.publicId;
    course.thumbnail = await uploadThumbnail(thumbnailFile);
    if (previous) await destroyAsset(previous).catch(() => undefined);
  }

  const assignable: Array<keyof ICourse> = [
    'shortDescription',
    'description',
    'price',
    'discountPrice',
    'category',
    'level',
    'durationHours',
    'instructor',
    'modules',
    'tags',
    'isPublished',
  ];

  for (const key of assignable) {
    if (payload[key] !== undefined) {
      (course as unknown as Record<string, unknown>)[key] = payload[key] as unknown;
    }
  }

  await course.save();
  return course;
};

const publish = async (id: string, isPublished: boolean): Promise<ICourseDocument> => {
  const course = await CourseModel.findByIdAndUpdate(
    id,
    { isPublished },
    { new: true, runValidators: true },
  );
  if (!course) throw new AppError('Course not found', 404);
  return course;
};

const remove = async (id: string): Promise<void> => {
  const course = await CourseModel.findByIdAndDelete(id);
  if (!course) throw new AppError('Course not found', 404);
  if (course.thumbnail?.publicId) {
    await destroyAsset(course.thumbnail.publicId).catch(() => undefined);
  }
};

interface CourseAnalytics {
  total: number;
  published: number;
  drafts: number;
  onSale: number;
  totalEnrollments: number;
  avgRating: number;
  byCategory: Array<{ category: string; count: number }>;
  topCourses: Array<{
    id: string;
    title: string;
    slug: string;
    enrollmentsCount: number;
    ratingAvg: number;
  }>;
}

const analytics = async (): Promise<CourseAnalytics> => {
  const [statusAgg, categoryAgg, topCourses] = await Promise.all([
    CourseModel.aggregate<{
      _id: null;
      total: number;
      published: number;
      drafts: number;
      onSale: number;
      enrollments: number;
      ratingSum: number;
      ratingDocs: number;
    }>([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          published: { $sum: { $cond: ['$isPublished', 1, 0] } },
          drafts: { $sum: { $cond: ['$isPublished', 0, 1] } },
          onSale: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: ['$discountPrice', 0] },
                    { $lt: ['$discountPrice', '$price'] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          enrollments: { $sum: '$enrollmentsCount' },
          ratingSum: { $sum: { $multiply: ['$ratingAvg', '$ratingCount'] } },
          ratingDocs: { $sum: '$ratingCount' },
        },
      },
    ]),
    CourseModel.aggregate<{ _id: string; count: number }>([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]),
    CourseModel.find({})
      .sort({ enrollmentsCount: -1, ratingAvg: -1 })
      .limit(5)
      .select('title slug enrollmentsCount ratingAvg')
      .lean(),
  ]);

  const agg = statusAgg[0];
  const total = agg?.total ?? 0;
  const ratingDocs = agg?.ratingDocs ?? 0;
  const avgRating = ratingDocs ? Math.round(((agg?.ratingSum ?? 0) / ratingDocs) * 10) / 10 : 0;

  return {
    total,
    published: agg?.published ?? 0,
    drafts: agg?.drafts ?? 0,
    onSale: agg?.onSale ?? 0,
    totalEnrollments: agg?.enrollments ?? 0,
    avgRating,
    byCategory: categoryAgg.map((row) => ({ category: row._id, count: row.count })),
    topCourses: topCourses.map((c) => ({
      id: String(c._id),
      title: c.title,
      slug: c.slug,
      enrollmentsCount: c.enrollmentsCount,
      ratingAvg: c.ratingAvg,
    })),
  };
};

export const CourseService = {
  create,
  list,
  getBySlug,
  getById,
  update,
  publish,
  remove,
  analytics,
};
