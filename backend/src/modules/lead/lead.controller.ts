import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { AppError } from '../../utils/AppError';
import { LeadService } from './lead.service';

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await LeadService.create(req.body);
  return sendResponse(res, {
    statusCode: 201,
    message: 'Thanks! We will be in touch shortly.',
    // `autoSignIn` (if present) carries one-time credentials the frontend uses
    // to transparently sign the new user in and drop them on /student. It is
    // intentionally NOT persisted anywhere on the client beyond a single call.
    data: { lead: result.lead, autoSignIn: result.autoSignIn ?? null },
  });
});

const list = catchAsync(async (req: Request, res: Response) => {
  const result = await LeadService.list(req.query as Record<string, unknown>);
  return sendResponse(res, {
    message: 'Leads fetched',
    data: result.data,
    meta: result.meta,
  });
});

const getOne = catchAsync(async (req: Request, res: Response) => {
  const lead = await LeadService.getById(req.params.id);
  return sendResponse(res, { message: 'Lead fetched', data: lead });
});

const updateStatus = catchAsync(async (req: Request, res: Response) => {
  const lead = await LeadService.updateStatus(req.params.id, req.body.status);
  return sendResponse(res, { message: 'Lead status updated', data: lead });
});

const addNote = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError('Not authenticated', 401);
  const lead = await LeadService.addNote(req.params.id, {
    message: req.body.message,
    authorId: req.user.id,
    authorName: req.user.name,
  });
  return sendResponse(res, { message: 'Note added', data: lead });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  await LeadService.remove(req.params.id);
  return sendResponse(res, { message: 'Lead deleted', data: null });
});

const mine = catchAsync(async (req: Request, res: Response) => {
  if (!req.user?.email) throw new AppError('Not authenticated', 401);
  const leads = await LeadService.listByEmail(req.user.email);
  return sendResponse(res, { message: 'My leads', data: leads });
});

const analytics = catchAsync(async (_req: Request, res: Response) => {
  const data = await LeadService.analytics();
  return sendResponse(res, { message: 'Lead analytics', data });
});

const exportCsv = catchAsync(async (req: Request, res: Response) => {
  const { status, source, search } = req.query as {
    status?: string;
    source?: string;
    search?: string;
  };
  const csv = await LeadService.exportCsv({ status, source, search });
  const filename = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.status(200).send(csv);
});

export const LeadController = {
  create,
  list,
  getOne,
  updateStatus,
  addNote,
  remove,
  mine,
  analytics,
  exportCsv,
};
