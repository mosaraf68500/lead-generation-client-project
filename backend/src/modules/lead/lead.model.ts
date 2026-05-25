import { Schema, model } from 'mongoose';
import { LEAD_STATUSES, type ILeadDocument } from './lead.interface';

const utmSchema = new Schema(
  {
    source: { type: String, trim: true },
    medium: { type: String, trim: true },
    campaign: { type: String, trim: true },
    term: { type: String, trim: true },
    content: { type: String, trim: true },
  },
  { _id: false },
);

const noteSchema = new Schema(
  {
    message: { type: String, required: true, trim: true, maxlength: 2048 },
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    authorName: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const leadSchema = new Schema<ILeadDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: { type: String, required: true, trim: true },
    whatsapp: { type: String, trim: true },
    country: { type: String, trim: true },
    preferredBatch: { type: String, trim: true, maxlength: 120 },
    occupation: { type: String, trim: true, maxlength: 120 },
    interestedCourse: { type: Schema.Types.ObjectId, ref: 'Course' },
    interestedCourses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    source: { type: String, required: true, trim: true, default: 'landing-form', index: true },
    message: { type: String, maxlength: 2048 },
    status: {
      type: String,
      enum: LEAD_STATUSES,
      default: 'new',
      required: true,
      index: true,
    },
    notes: { type: [noteSchema], default: [] },
    utm: { type: utmSchema, default: undefined },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
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

leadSchema.index({ status: 1, createdAt: -1 });
leadSchema.index({ email: 1, createdAt: -1 });

export const LeadModel = model<ILeadDocument>('Lead', leadSchema);
