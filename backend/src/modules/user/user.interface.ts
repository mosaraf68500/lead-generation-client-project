import type { Document, Types } from 'mongoose';
import type { UserRole } from '../../types/common.types';

/**
 * Domain User shape. This document lives in the same MongoDB collection that
 * Better Auth writes to (`user`), so the field names here MUST match what
 * Better Auth persists; our additional profile fields are declared on top.
 */
export interface IUser {
  _id: Types.ObjectId | string;
  email: string;
  name: string;
  emailVerified?: boolean;
  image?: string;

  role: UserRole;
  phone?: string;
  avatar?: string;
  bio?: string;
  country?: string;

  createdAt: Date;
  updatedAt: Date;
}

export type IUserDocument = IUser & Document;
