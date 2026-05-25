/**
 * Mongoose mirror of the Better Auth `user` collection. We don't own
 * `email`/`emailVerified`/`name`/`image` (Better Auth manages those), but we
 * DO own `role` and the profile fields and use this model for our domain
 * reads + selective updates. `strict: false` lets the document carry any
 * additional auth-managed fields we don't model here.
 */
import { Schema, model } from 'mongoose';
import { USER_ROLES } from '../../types/common.types';
import type { IUserDocument } from './user.interface';

const userSchema = new Schema<IUserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    emailVerified: { type: Boolean, default: false },
    image: { type: String },

    role: {
      type: String,
      enum: USER_ROLES,
      default: 'student',
      required: true,
      index: true,
    },
    phone: { type: String, trim: true },
    avatar: { type: String },
    bio: { type: String, maxlength: 1024 },
    country: { type: String, trim: true },
  },
  {
    collection: 'user', // Match Better Auth's default collection name.
    strict: false,
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

userSchema.index({ role: 1, createdAt: -1 });

export const UserModel = model<IUserDocument>('User', userSchema);
