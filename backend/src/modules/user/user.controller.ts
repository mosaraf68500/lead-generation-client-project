import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { UserService } from './user.service';
import { AppError } from '../../utils/AppError';

const list = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.list(req.query as Record<string, unknown>);
  return sendResponse(res, {
    message: 'Users fetched',
    data: result.data,
    meta: result.meta,
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError('Not authenticated', 401);
  const user = await UserService.getById(req.user.id);
  return sendResponse(res, { message: 'Profile fetched', data: user });
});

const updateMe = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError('Not authenticated', 401);
  const user = await UserService.updateProfile(req.user.id, req.body);
  return sendResponse(res, { message: 'Profile updated', data: user });
});

const getOne = catchAsync(async (req: Request, res: Response) => {
  const user = await UserService.getById(req.params.id);
  return sendResponse(res, { message: 'User fetched', data: user });
});

const updateRole = catchAsync(async (req: Request, res: Response) => {
  const user = await UserService.setRole(req.params.id, req.body.role);
  return sendResponse(res, { message: 'Role updated', data: user });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  await UserService.remove(req.params.id);
  return sendResponse(res, { message: 'User deleted', data: null });
});

export const UserController = {
  list,
  getMe,
  updateMe,
  getOne,
  updateRole,
  remove,
};
