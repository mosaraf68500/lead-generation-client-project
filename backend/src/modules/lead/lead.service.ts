import { Types, type FilterQuery, type PipelineStage } from 'mongoose';
import { LeadModel } from './lead.model';
import type { ILead, ILeadDocument, ILeadNote, LeadStatus } from './lead.interface';
import { AppError } from '../../utils/AppError';
import { QueryBuilder } from '../../utils/queryBuilder';
import { logger } from '../../utils/logger';
import { AuthService } from '../auth/auth.service';
import { UserModel } from '../user/user.model';
import type { AuthenticatedUser, UserRole } from '../../types/common.types';

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

/**
 * Role-aware access context attached to every read/write that goes through
 * the lead service. `staff` is auto-scoped to leads where `assignedTo`
 * matches `userId`; admins / super-admins see everything.
 */
export interface LeadAccessCtx {
  userId: string;
  role: UserRole;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const isStaffScoped = (ctx?: LeadAccessCtx): boolean => ctx?.role === 'staff';

/** Build the Mongo filter that scopes a query to the caller when needed. */
const accessFilter = (ctx?: LeadAccessCtx): FilterQuery<ILeadDocument> => {
  if (!isStaffScoped(ctx)) return {};
  // Cast through `string` so TS doesn't complain about mixed ObjectId / string.
  return { assignedTo: new Types.ObjectId(ctx!.userId) };
};

/**
 * Throws 403 if the caller is a staff member trying to touch a lead that
 * isn't assigned to them. Admin + super-admin always pass through.
 */
const assertStaffOwnsLead = (lead: ILeadDocument, ctx?: LeadAccessCtx): void => {
  if (!isStaffScoped(ctx)) return;
  const ownerId = lead.assignedTo ? lead.assignedTo.toString() : null;
  if (ownerId !== ctx!.userId) {
    throw new AppError(
      'This lead is assigned to another team member',
      403,
    );
  }
};

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

const list = async (query: Record<string, unknown>, ctx?: LeadAccessCtx) => {
  // The access scope is applied as the BASE filter on the find() so QueryBuilder
  // ANDs every other filter on top — staff are physically incapable of seeing
  // unassigned leads or another teammate's leads.
  const base = accessFilter(ctx);

  // Staff cannot override the assignedTo filter; strip it from incoming query.
  const safeQuery = { ...query };
  if (isStaffScoped(ctx)) delete safeQuery.assignedTo;

  const builder = new QueryBuilder<ILeadDocument>(
    LeadModel.find(base)
      .populate('interestedCourse', 'title slug thumbnail')
      .populate('assignedTo', 'name email role avatar'),
    safeQuery,
  )
    .search(['name', 'email', 'phone', 'message', 'occupation', 'preferredBatch'])
    .filter(['status', 'source', 'interestedCourse', 'assignedTo'])
    .sort('-createdAt')
    .selectFields()
    .paginate();
  return builder.exec();
};

const getById = async (id: string, ctx?: LeadAccessCtx): Promise<ILeadDocument> => {
  const lead = await LeadModel.findById(id)
    .populate('interestedCourse', 'title slug')
    .populate('assignedTo', 'name email role avatar');
  if (!lead) throw new AppError('Lead not found', 404);
  assertStaffOwnsLead(lead, ctx);
  return lead;
};

const updateStatus = async (
  id: string,
  status: LeadStatus,
  ctx?: LeadAccessCtx,
): Promise<ILeadDocument> => {
  // Read first so we can run the ownership check, then update.
  const existing = await LeadModel.findById(id);
  if (!existing) throw new AppError('Lead not found', 404);
  assertStaffOwnsLead(existing, ctx);

  existing.status = status;
  await existing.save();
  return existing.populate('assignedTo', 'name email role avatar');
};

const addNote = async (
  id: string,
  input: AddNoteInput,
  ctx?: LeadAccessCtx,
): Promise<ILeadDocument> => {
  const existing = await LeadModel.findById(id);
  if (!existing) throw new AppError('Lead not found', 404);
  assertStaffOwnsLead(existing, ctx);

  const note: ILeadNote = {
    message: input.message.trim(),
    author: input.authorId,
    authorName: input.authorName,
    createdAt: new Date(),
  };
  existing.notes = [...(existing.notes ?? []), note];
  await existing.save();
  return existing.populate('assignedTo', 'name email role avatar');
};

const remove = async (id: string): Promise<void> => {
  const lead = await LeadModel.findByIdAndDelete(id);
  if (!lead) throw new AppError('Lead not found', 404);
};

/**
 * Assign (or unassign) a lead to a staff/admin user.
 * Appends an audit note so the timeline records who reassigned + when.
 */
const assign = async (
  leadId: string,
  assigneeId: string | null,
  actor: AuthenticatedUser,
): Promise<ILeadDocument> => {
  const lead = await LeadModel.findById(leadId);
  if (!lead) throw new AppError('Lead not found', 404);

  let assigneeName: string | null = null;
  if (assigneeId) {
    const user = await UserModel.findById(assigneeId).select('name email role');
    if (!user) throw new AppError('Assignee not found', 404);
    if (!['staff', 'admin', 'super_admin'].includes(user.role)) {
      throw new AppError(
        'Leads can only be assigned to staff, admins or super-admins',
        400,
      );
    }
    assigneeName = user.name || user.email;
    lead.assignedTo = user._id as Types.ObjectId;
  } else {
    lead.assignedTo = undefined;
  }

  lead.notes = [
    ...(lead.notes ?? []),
    {
      message: assigneeId
        ? `Assigned to ${assigneeName}`
        : 'Unassigned (back to triage queue)',
      author: actor.id,
      authorName: actor.name || actor.email,
      createdAt: new Date(),
    },
  ];

  await lead.save();
  return lead.populate('assignedTo', 'name email role avatar');
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
  filter: { status?: string; source?: string; search?: string; assignedTo?: string },
  ctx?: LeadAccessCtx,
): Promise<string> => {
  const mongoFilter: FilterQuery<ILeadDocument> = {};
  if (filter.status) mongoFilter.status = filter.status as LeadStatus;
  if (filter.source) mongoFilter.source = filter.source;
  // Staff scoping always wins — even if the request body specifies a different
  // assignee, we override to the caller's own id.
  if (isStaffScoped(ctx)) {
    mongoFilter.assignedTo = new Types.ObjectId(ctx!.userId);
  } else if (filter.assignedTo) {
    mongoFilter.assignedTo = new Types.ObjectId(filter.assignedTo);
  }
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
    .populate('assignedTo', 'name email')
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
    'assignedTo',
    'country',
    'message',
    'notesCount',
  ];

  const rows = leads.map((l) => {
    const interestedTitle =
      l.interestedCourse && typeof l.interestedCourse === 'object'
        ? (l.interestedCourse as unknown as { title?: string }).title ?? ''
        : '';
    const assignedToName =
      l.assignedTo && typeof l.assignedTo === 'object'
        ? (l.assignedTo as unknown as { name?: string; email?: string }).name ??
          (l.assignedTo as unknown as { email?: string }).email ??
          ''
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
      assignedToName,
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

/**
 * Aggregated KPIs powering the staff/admin dashboards.
 * Staff callers get aggregations scoped to their own assigned leads.
 */
const analytics = async (ctx?: LeadAccessCtx): Promise<LeadAnalytics> => {
  const since = new Date();
  since.setDate(since.getDate() - 30);

  // Prepend a $match stage to every pipeline when scoping for staff. Admins +
  // super-admins still see the full-platform picture.
  const scopeMatch: PipelineStage[] = isStaffScoped(ctx)
    ? [{ $match: { assignedTo: new Types.ObjectId(ctx!.userId) } }]
    : [];

  const [statusCounts, sourceCounts, dailyCounts, totalAgg] = await Promise.all([
    LeadModel.aggregate<{ _id: LeadStatus; count: number }>([
      ...scopeMatch,
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    LeadModel.aggregate<{ _id: string; count: number }>([
      ...scopeMatch,
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]),
    LeadModel.aggregate<{ _id: string; count: number }>([
      ...scopeMatch,
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
      ...scopeMatch,
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

// ---------------------------------------------------------------------------
// Per-staff performance KPIs
// ---------------------------------------------------------------------------

export interface StaffPerformance {
  /** Total leads ever assigned to the staff member. */
  assignedTotal: number;
  /** Leads assigned to them and created today. */
  assignedToday: number;
  /** Leads assigned in the last 7 days. */
  assignedThisWeek: number;
  byStatus: {
    new: number;
    contacted: number;
    in_progress: number;
    enrolled: number;
    junk: number;
  };
  /** Personal conversion rate (`enrolled / assignedTotal`). */
  conversionRate: number;
}

const myPerformance = async (userId: string): Promise<StaffPerformance> => {
  const ownerId = new Types.ObjectId(userId);
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [statusCounts, totals] = await Promise.all([
    LeadModel.aggregate<{ _id: LeadStatus; count: number }>([
      { $match: { assignedTo: ownerId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    LeadModel.aggregate<{ _id: null; total: number; today: number; week: number }>([
      { $match: { assignedTo: ownerId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          today: {
            $sum: { $cond: [{ $gte: ['$createdAt', startOfDay] }, 1, 0] },
          },
          week: {
            $sum: { $cond: [{ $gte: ['$createdAt', sevenDaysAgo] }, 1, 0] },
          },
        },
      },
    ]),
  ]);

  const byStatus = statusCounts.reduce<Record<string, number>>((acc, row) => {
    acc[row._id] = row.count;
    return acc;
  }, {});
  const total = totals[0]?.total ?? 0;
  const enrolled = byStatus.enrolled ?? 0;

  return {
    assignedTotal: total,
    assignedToday: totals[0]?.today ?? 0,
    assignedThisWeek: totals[0]?.week ?? 0,
    byStatus: {
      new: byStatus.new ?? 0,
      contacted: byStatus.contacted ?? 0,
      in_progress: byStatus.in_progress ?? 0,
      enrolled,
      junk: byStatus.junk ?? 0,
    },
    conversionRate: total === 0 ? 0 : Math.round((enrolled / total) * 1000) / 10,
  };
};

export const LeadService = {
  create,
  list,
  getById,
  updateStatus,
  addNote,
  assign,
  remove,
  listByEmail,
  exportCsv,
  analytics,
  myPerformance,
};
