import { Schema, model } from 'mongoose';
import slugify from 'slugify';
import { COURSE_LEVELS, type ICourseDocument } from './course.interface';

const mediaSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: false },
);

const lessonSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    videoUrl: { type: String },
    durationMin: { type: Number, default: 0, min: 0 },
  },
  { _id: false },
);

const moduleSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    lessons: { type: [lessonSchema], default: [] },
  },
  { _id: false },
);

const courseSchema = new Schema<ICourseDocument>(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    shortDescription: { type: String, required: true, maxlength: 280 },
    description: { type: String, required: true },
    thumbnail: { type: mediaSchema, required: true },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    category: { type: String, required: true, trim: true, index: true },
    level: { type: String, enum: COURSE_LEVELS, required: true, index: true },
    durationHours: { type: Number, required: true, min: 0 },
    instructor: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    modules: { type: [moduleSchema], default: [] },
    tags: { type: [String], default: [], index: true },
    isPublished: { type: Boolean, default: false, index: true },
    enrollmentsCount: { type: Number, default: 0, min: 0 },
    ratingAvg: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id;
        // See category.model — `__v` is typed required on the lean doc;
        // cast through a generic record so `delete` is well-typed.
        delete (ret as Record<string, unknown>).__v;
        return ret;
      },
    },
  },
);

// Cross-cutting indexes that match our common list queries.
courseSchema.index({ isPublished: 1, category: 1, level: 1 });
courseSchema.index({ title: 'text', shortDescription: 'text', tags: 'text' });

/**
 * Auto-slug on title change. The service layer can override `doc.slug`
 * before save if a custom slug is desired (e.g. SEO override from staff).
 */
courseSchema.pre('save', function preSave(next) {
  if (this.isModified('title') && !this.isModified('slug')) {
    this.slug = slugify(this.title, { lower: true, strict: true, trim: true });
  }
  next();
});

export const CourseModel = model<ICourseDocument>('Course', courseSchema);
