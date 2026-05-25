import type { FilterQuery } from 'mongoose';
import { LeadModel } from './lead.model';
import type { ILead, ILeadDocument, ILeadNote, LeadStatus } from './lead.interface';
import { AppError } from '../../utils/AppError';
import { QueryBuilder } from '../../utils/queryBuilder';
import { logger } from '../../utils/logger';
import { AuthService } from '../auth/auth.service';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CreateLeadPayload = Omit<
  ILead,
  '_id' | 'status' | 'createdAt' | 'updatedAt' | 'assignedTo' | 'notes'
>;

export interface CreateLeadResult {
  lead: ILeadDocument;
  /**
   * When the submitter is a brand-new user we auto-provision a student
   * account for them. The frontend uses these one-time credentials to sign
   * them in transparently and redirect to /student.
   */
  autoSignIn?: { email: string; password: string };
}

export interface AddNoteInput {
  message: string;
  authorId?: string;
  authorName?: string;
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

const create = async (payload: CreateLeadPayload): Promise<CreateLeadResult> => {
  const lead = await LeadModel.create({ ...payload, status: 'new', notes: [] });
  logger.info({ leadId: lead.id, source: lead.source }, 'New lead captured');

  // Best-effort auto-provisioning: if the lead submitter isn't already a user
  // we create a `student` account so the frontend can drop them straight into
  // the dashboard. A provisioning failure should NOT take down the public
  // form, so we swallow the error and just skip the auto-signin.
  let autoSignIn: CreateLeadResult['autoSignIn'];
  try {
    const result = await AuthService.ensureStudentFromLead({
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
    });
    if (result.created && result.password) {
      autoSignIn = { email: payload.email.toLowerCase(), password: result.password };
    }
  } catch (err) {
    logger.warn({ err, leadId: lead.id }, 'Lead saved but student auto-provisioning failed');
  }

  return { lead, autoSignIn };
};

const list = async (query: Record<string, unknown>) => {
  const builder = new QueryBuilder<ILeadDocument>(
    LeadModel.find({} as FilterQuery<ILeadDocument>).populate(
      'interestedCourse',
      'title slug thumbnail',
    ),
    query,
  )
    .search(['name', 'email', 'phone', 'message', 'occupation', 'preferredBatch'])
    .filter(['status', 'source', 'interestedCourse'])
    .sort('-createdAt')
    .selectFields()
    .paginate();
  return builder.exec();
};

const getById = async (id: string): Promise<ILeadDocument> => {
  const lead = await LeadModel.findById(id).populate('interestedCourse', 'title slug');
  if (!lead) throw new AppError('Lead not found', 404);
  return lead;
};

const updateStatus = async (id: string, status: LeadStatus): Promise<ILeadDocument> => {
  const lead = await LeadModel.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true },
  );
  if (!lead) throw new AppError('Lead not found', 404);
  return lead;
};

const addNote = async (id: string, input: AddNoteInput): Promise<ILeadDocument> => {
  const note: ILeadNote = {
    message: input.message.trim(),
    author: input.authorId,
    authorName: input.authorName,
    createdAt: new Date(),
  };
  const lead = await LeadModel.findByIdAndUpdate(
    id,
    { $push: { notes: note } },
    { new: true, runValidators: true },
  );
  if (!lead) throw new AppError('Lead not found', 404);
  return lead;
};

const remove = async (id: string): Promise<void> => {
  const lead = await LeadModel.findByIdAndDelete(id);
  if (!lead) throw new AppError('Lead not found', 404);
};

const listByEmail = async (email: string): Promise<ILeadDocument[]> => {
  return LeadModel.find({ email: email.toLowerCase() })
    .sort({ createdAt: -1 })
    .populate('interestedCourse', 'title slug');
};

// ---------------------------------------------------------------------------
// Export (CSV)
// ---------------------------------------------------------------------------

const csvEscape = (val: unknown): string => {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
};

const exportCsv = async (
  filter: { status?: string; source?: string; search?: string },
): Promise<string> => {
  // Build the same filter shape the list endpoint uses, minus pagination.
  const mongoFilter: FilterQuery<ILeadDocument> = {};
  if (filter.status) mongoFilter.status = filter.status as LeadStatus;
  if (filter.source) mongoFilter.source = filter.source;
  if (filter.search) {
    const safe = filter.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = { $regex: safe, $options: 'i' };
    mongoFilter.$or = [
      { name: regex },
      { email: regex },
      { phone: regex },
      { message: regex },
      { occupation: regex },
      { preferredBatch: regex },
    ];
  }

  const leads = await LeadModel.find(mongoFilter)
    .populate('interestedCourse', 'title slug')
    .sort({ createdAt: -1 })
    .lean();

  const headers = [
    'createdAt',
    'name',
    'email',
    'phone',
    'whatsapp',
    'occupation',
    'preferredBatch',
    'status',
    'source',
    'interestedCourse',
    'country',
    'message',
    'notesCount',
  ];

  const rows = leads.map((l) => {
    const interestedTitle =
      l.interestedCourse && typeof l.interestedCourse === 'object'
        ? (l.interestedCourse as unknown as { title?: string }).title ?? ''
        : '';
    return [
      l.createdAt instanceof Date ? l.createdAt.toISOString() : String(l.createdAt ?? ''),
      l.name,
      l.email,
      l.phone,
      l.whatsapp ?? '',
      l.occupation ?? '',
      l.preferredBatch ?? '',
      l.status,
      l.source,
      interestedTitle,
      l.country ?? '',
      l.message ?? '',
      (l.notes ?? []).length,
    ].map(csvEscape).join(',');
  });

  return [headers.join(','), ...rows].join('\n');
};

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

interface LeadAnalytics {
  total: number;
  newCount: number;
  contactedCount: number;
  inProgressCount: number;
  enrolledCount: number;
  junkCount: number;
  conversionRate: number;
  bySource: Array<{ source: string; count: number }>;
  byDay: Array<{ date: string; count: number }>;
}

/** Aggregated KPIs powering the staff/admin dashboards. */
const analytics = async (): Promise<LeadAnalytics> => {
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const [statusCounts, sourceCounts, dailyCounts, totalAgg] = await Promise.all([
    LeadModel.aggregate<{ _id: LeadStatus; count: number }>([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    LeadModel.aggregate<{ _id: string; count: number }>([
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]),
    LeadModel.aggregate<{ _id: string; count: number }>([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    LeadModel.aggregate<{ _id: null; count: number }>([
      { $group: { _id: null, count: { $sum: 1 } } },
    ]),
  ]);

  const total = totalAgg[0]?.count ?? 0;
  const byStatus = statusCounts.reduce<Record<string, number>>((acc, row) => {
    acc[row._id] = row.count;
    return acc;
  }, {});

  const enrolled = byStatus.enrolled ?? 0;
  return {
    total,
    newCount: byStatus.new ?? 0,
    contactedCount: byStatus.contacted ?? 0,
    inProgressCount: byStatus.in_progress ?? 0,
    enrolledCount: enrolled,
    junkCount: byStatus.junk ?? 0,
    conversionRate: total === 0 ? 0 : Math.round((enrolled / total) * 1000) / 10,
    bySource: sourceCounts.map((row) => ({ source: row._id, count: row.count })),
    byDay: dailyCounts.map((row) => ({ date: row._id, count: row.count })),
  };
};

export const LeadService = {
  create,
  list,
  getById,
  updateStatus,
  addNote,
  remove,
  listByEmail,
  exportCsv,
  analytics,
};
