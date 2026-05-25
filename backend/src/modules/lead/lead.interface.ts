import type { Document, Types } from 'mongoose';

/**
 * Lead lifecycle statuses for the CRM.
 *
 *   new          → Just captured by the public form. Has not been contacted yet.
 *   contacted    → Staff has reached out (call / WhatsApp / email).
 *   in_progress  → Conversation underway / awaiting reply / scheduled call.
 *   enrolled     → Lead successfully converted to a paying student.
 *   junk         → Spam, fake details, or "not interested" closed leads.
 */
export const LEAD_STATUSES = [
  'new',
  'contacted',
  'in_progress',
  'enrolled',
  'junk',
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export interface ILeadUtm {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}

/** A staff/admin note attached to a lead. Append-only. */
export interface ILeadNote {
  /** Note body — what the staff member jotted down. */
  message: string;
  /** ObjectId of the staff/admin who authored the note. */
  author?: Types.ObjectId | string;
  /** Denormalised author name for fast display without a join. */
  authorName?: string;
  createdAt: Date;
}

export interface ILead {
  _id: Types.ObjectId | string;
  name: string;
  email: string;
  phone: string;
  /** Optional dedicated WhatsApp number; falls back to `phone` if missing. */
  whatsapp?: string;
  country?: string;
  /** Preferred batch / time slot the lead requested (e.g. "Morning batch", "Weekends"). */
  preferredBatch?: string;
  /** Current occupation as self-reported. Helps the sales team triage. */
  occupation?: string;
  interestedCourse?: Types.ObjectId | string;
  /** Courses they expressed interest in via the cart, when submitting a bucket. */
  interestedCourses?: Array<Types.ObjectId | string>;
  source: string; // 'landing-form' | 'contact-page' | 'navbar-cta' | 'course-modal' | ...
  message?: string;
  status: LeadStatus;
  /** Append-only audit log of staff actions / call notes. */
  notes: ILeadNote[];
  utm?: ILeadUtm;
  assignedTo?: Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

export type ILeadDocument = ILead & Document;
