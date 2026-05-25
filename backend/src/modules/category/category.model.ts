import { Schema, model } from 'mongoose';
import slugify from 'slugify';
import type { ICategoryDocument } from './category.interface';

const categorySchema = new Schema<ICategoryDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80, unique: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, trim: true, maxlength: 280 },
    iconKey: { type: String, trim: true, maxlength: 40 },
    sortOrder: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Compound index to support the common "active categories, sorted" list query.
categorySchema.index({ isActive: 1, sortOrder: 1, name: 1 });

/**
 * Auto-slug on name change. Service layer can override `doc.slug` before
 * save if a custom slug is desired (e.g. SEO override).
 */
categorySchema.pre('save', function preSave(next) {
  if (this.isModified('name') && !this.isModified('slug')) {
    this.slug = slugify(this.name, { lower: true, strict: true, trim: true });
  }
  next();
});

export const CategoryModel = model<ICategoryDocument>('Category', categorySchema);
