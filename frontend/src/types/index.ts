/** Domain-wide types mirrored from the backend module interfaces. */

export const USER_ROLES = ['student', 'staff', 'admin', 'super_admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const COURSE_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;
export type CourseLevel = (typeof COURSE_LEVELS)[number];

export const LEAD_STATUSES = [
  'new',
  'contacted',
  'in_progress',
  'enrolled',
  'junk',
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

/** Display label + tone for a lead status, used in CRM tables and timelines. */
export const LEAD_STATUS_META: Record<
  LeadStatus,
  { label: string; tone: 'brand' | 'success' | 'warning' | 'danger' | 'neutral' }
> = {
  new: { label: 'New', tone: 'brand' },
  contacted: { label: 'Contacted', tone: 'neutral' },
  in_progress: { label: 'In progress', tone: 'warning' },
  enrolled: { label: 'Enrolled', tone: 'success' },
  junk: { label: 'Junk', tone: 'danger' },
};

export interface LeadNote {
  _id?: string;
  message: string;
  author?: string;
  authorName?: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  bio?: string;
  country?: string;
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseMedia {
  url: string;
  publicId: string;
}

export interface CourseLesson {
  title: string;
  videoUrl?: string;
  durationMin: number;
}

export interface CourseModuleType {
  title: string;
  lessons: CourseLesson[];
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  thumbnail: CourseMedia;
  price: number;
  discountPrice?: number;
  category: string;
  level: CourseLevel;
  durationHours: number;
  instructor: Pick<User, 'id' | 'name' | 'avatar' | 'bio'> | string;
  modules: CourseModuleType[];
  tags: string[];
  isPublished: boolean;
  enrollmentsCount: number;
  ratingAvg: number;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Minimal shape returned by the backend when `assignedTo` is populated.
 * Lead responses include this when the caller is admin/super-admin so the
 * CRM table can show who owns each row.
 */
export interface LeadAssignee {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  country?: string;
  preferredBatch?: string;
  occupation?: string;
  interestedCourse?: Pick<Course, 'id' | 'title' | 'slug'> | string;
  interestedCourses?: Array<Pick<Course, 'id' | 'title' | 'slug'> | string>;
  source: string;
  message?: string;
  status: LeadStatus;
  notes?: LeadNote[];
  /** Either an id string (unpopulated) or the populated user shape. */
  assignedTo?: LeadAssignee | string | null;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
  createdAt: string;
  updatedAt: string;
}

/** Personal performance KPIs for a single staff member (`/leads/my-performance`). */
export interface StaffPerformance {
  assignedTotal: number;
  assignedToday: number;
  assignedThisWeek: number;
  byStatus: Record<LeadStatus, number>;
  conversionRate: number;
}

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Course taxonomy entry. The admin "Categories" page surfaces these rows
 * with their derived course counts.
 */
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  iconKey?: string;
  sortOrder: number;
  isActive: boolean;
  courseCount?: number;
  publishedCount?: number;
  createdAt: string;
  updatedAt: string;
}
