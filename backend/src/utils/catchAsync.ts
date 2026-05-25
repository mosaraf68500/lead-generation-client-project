/**
 * Tiny wrapper that turns an async Express handler into one that automatically
 * forwards rejected promises to `next(error)`. Eliminates repetitive
 * try/catch boilerplate in every controller.
 */
import type { NextFunction, Request, RequestHandler, Response } from 'express';

type AsyncHandler<P = unknown, ResBody = unknown, ReqBody = unknown, ReqQuery = unknown> = (
  req: Request<P, ResBody, ReqBody, ReqQuery>,
  res: Response<ResBody>,
  next: NextFunction,
) => Promise<unknown>;

export const catchAsync =
  <P = unknown, ResBody = unknown, ReqBody = unknown, ReqQuery = unknown>(
    fn: AsyncHandler<P, ResBody, ReqBody, ReqQuery>,
  ): RequestHandler<P, ResBody, ReqBody, ReqQuery> =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
