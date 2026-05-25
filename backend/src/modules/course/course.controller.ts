import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { CourseService } from './course.service';

const create = catchAsync(async (req: Request, res: Response) => {
  const thumbnail = req.file
    ? { buffer: req.file.buffer, mimetype: req.file.mimetype, originalname: req.file.originalname }
    : undefined;
  const course = await CourseService.create(req.body, thumbnail);
  return sendResponse(res, {
    statusCode: 201,
    message: 'Course created',
    data: course,
  });
});

const list = catchAsync(async (req: Request, res: Response) => {
  // Public callers only see published courses; staff/admin can override.
  const queryParams: Record<string, unknown> = { ...(req.query as Record<string, unknown>) };
  const role = req.user?.role;
  if (!role || role === 'student') queryParams.isPublished = true;

  const result = await CourseService.list(queryParams);
  return sendResponse(res, {
    message: 'Courses fetched',
    data: result.data,
    meta: result.meta,
  });
});

const getBySlug = catchAsync(async (req: Request, res: Response) => {
  const course = await CourseService.getBySlug(req.params.slug);
  return sendResponse(res, { message: 'Course fetched', data: course });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const thumbnail = req.file
    ? { buffer: req.file.buffer, mimetype: req.file.mimetype, originalname: req.file.originalname }
    : undefined;
  const course = await CourseService.update(req.params.id, req.body, thumbnail);
  return sendResponse(res, { message: 'Course updated', data: course });
});

const publish = catchAsync(async (req: Request, res: Response) => {
  const course = await CourseService.publish(req.params.id, Boolean(req.body.isPublished));
  return sendResponse(res, { message: 'Publish state updated', data: course });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  await CourseService.remove(req.params.id);
  return sendResponse(res, { message: 'Course deleted', data: null });
});

const analytics = catchAsync(async (_req: Request, res: Response) => {
  const data = await CourseService.analytics();
  return sendResponse(res, { message: 'Course analytics', data });
});

export const CourseController = { create, list, getBySlug, update, publish, remove, analytics };
