import type { Document, Types } from 'mongoose';

export const COURSE_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;
export type CourseLevel = (typeof COURSE_LEVELS)[number];

export interface ICourseMedia {
  url: string;
  publicId: string;
}

export interface ICourseLesson {
  title: string;
  videoUrl?: string;
  durationMin: number;
}

export interface ICourseModule {
  title: string;
  lessons: ICourseLesson[];
}

export interface ICourse {
  _id: Types.ObjectId | string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  thumbnail: ICourseMedia;
  price: number;
  discountPrice?: number;
  category: string;
  level: CourseLevel;
  durationHours: number;
  instructor: Types.ObjectId | string;
  modules: ICourseModule[];
  tags: string[];
  isPublished: boolean;
  enrollmentsCount: number;
  ratingAvg: number;
  ratingCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export type ICourseDocument = ICourse & Document;
