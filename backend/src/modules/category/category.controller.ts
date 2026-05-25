import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { CategoryService } from './category.service';

const create = catchAsync(async (req: Request, res: Response) => {
  const cat = await CategoryService.create(req.body);
  return sendResponse(res, {
    statusCode: 201,
    message: 'Category created',
    data: cat,
  });
});

const list = catchAsync(async (req: Request, res: Response) => {
  // Public callers only get active rows; authenticated admin sees everything.
  const queryParams: Record<string, unknown> = { ...(req.query as Record<string, unknown>) };
  const role = req.user?.role;
  if (!role || role === 'student') queryParams.isActive = true;

  const result = await CategoryService.list(queryParams);
  return sendResponse(res, {
    message: 'Categories fetched',
    data: result.data,
    meta: result.meta,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const cat = await CategoryService.update(req.params.id, req.body);
  return sendResponse(res, { message: 'Category updated', data: cat });
});

const setActive = catchAsync(async (req: Request, res: Response) => {
  const { category, cascadedCourses } = await CategoryService.setActive(
    req.params.id,
    Boolean(req.body.isActive),
  );
  return sendResponse(res, {
    message:
      cascadedCourses > 0
        ? `Category deactivated · ${cascadedCourses} course(s) unpublished`
        : 'Category status updated',
    data: { category, cascadedCourses },
  });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  await CategoryService.remove(req.params.id);
  return sendResponse(res, { message: 'Category deleted', data: null });
});

export const CategoryController = { create, list, update, setActive, remove };
