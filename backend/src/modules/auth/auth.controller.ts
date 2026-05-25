import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { AuthService } from './auth.service';
import { AppError } from '../../utils/AppError';

const getMe = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError('Not authenticated', 401);
  const profile = await AuthService.getEnrichedProfile(req.user.id);
  return sendResponse(res, {
    statusCode: 200,
    message: 'Authenticated session resolved',
    data: profile,
  });
});

export const AuthController = { getMe };
