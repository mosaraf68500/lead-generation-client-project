/**
 * Tiny zod-powered request validator. Pass a schema describing any of
 * `body`, `params`, `query` and the parsed (and possibly transformed) result
 * is written back onto the request object.
 */
import type { NextFunction, Request, Response } from 'express';
import { type AnyZodObject, ZodError, z } from 'zod';
import { AppError } from '../utils/AppError';

interface ValidateOptions {
  body?: AnyZodObject | z.ZodEffects<AnyZodObject>;
  params?: AnyZodObject | z.ZodEffects<AnyZodObject>;
  query?: AnyZodObject | z.ZodEffects<AnyZodObject>;
}

export const validate =
  (schemas: ValidateOptions) =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schemas.body) req.body = await schemas.body.parseAsync(req.body);
      if (schemas.params) req.params = (await schemas.params.parseAsync(req.params)) as typeof req.params;
      if (schemas.query) req.query = (await schemas.query.parseAsync(req.query)) as typeof req.query;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return next(
          new AppError('Validation failed', 400, {
            issues: err.issues.map((issue) => ({
              path: issue.path.join('.'),
              message: issue.message,
              code: issue.code,
            })),
          }),
        );
      }
      next(err);
    }
  };
