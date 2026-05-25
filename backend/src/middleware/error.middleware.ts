/**
 * Global error handler. Normalises every error thrown anywhere in the API
 * to the same envelope so the frontend only needs one parser.
 *
 * Sources of error we explicitly map:
 *   - AppError                 -> as-is
 *   - ZodError                 -> 400 with issues
 *   - Mongoose ValidationError -> 400 with per-path issues
 *   - Mongoose CastError       -> 400 invalid id/type
 *   - Mongo duplicate key      -> 409 with the offending field
 *   - Anything else            -> 500 (only stack trace shown in dev)
 */
import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';
import { env } from '../config/env';

interface ErrorSource {
  path: string;
  message: string;
}

interface NormalisedError {
  statusCode: number;
  message: string;
  errorSources: ErrorSource[];
}

const normalise = (err: unknown): NormalisedError => {
  if (err instanceof AppError) {
    const sources: ErrorSource[] = [];
    const details = err.details as { issues?: ErrorSource[] } | undefined;
    if (details?.issues) sources.push(...details.issues);
    return { statusCode: err.statusCode, message: err.message, errorSources: sources };
  }

  if (err instanceof ZodError) {
    return {
      statusCode: 400,
      message: 'Validation failed',
      errorSources: err.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    };
  }

  if (err instanceof mongoose.Error.ValidationError) {
    return {
      statusCode: 400,
      message: 'Mongoose validation error',
      errorSources: Object.values(err.errors).map((e) => ({
        path: e.path,
        message: e.message,
      })),
    };
  }

  if (err instanceof mongoose.Error.CastError) {
    return {
      statusCode: 400,
      message: `Invalid ${err.path}: ${err.value}`,
      errorSources: [{ path: err.path, message: err.message }],
    };
  }

  // Mongo duplicate-key surfaces as a plain Error with `code === 11000`.
  if (typeof err === 'object' && err !== null && (err as { code?: number }).code === 11000) {
    const keyValue = (err as { keyValue?: Record<string, unknown> }).keyValue ?? {};
    const [field, value] = Object.entries(keyValue)[0] ?? ['field', 'value'];
    return {
      statusCode: 409,
      message: `Duplicate value for ${field}`,
      errorSources: [{ path: String(field), message: `${value} already exists` }],
    };
  }

  return {
    statusCode: 500,
    message: err instanceof Error ? err.message : 'Internal server error',
    errorSources: [],
  };
};

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const { statusCode, message, errorSources } = normalise(err);

  // We log every 5xx; client errors are typically expected and noise-free.
  if (statusCode >= 500) {
    logger.error({ err, path: req.originalUrl, method: req.method }, 'Unhandled error');
  } else {
    logger.warn({ statusCode, path: req.originalUrl }, message);
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errorSources,
    ...(env.NODE_ENV !== 'production' && err instanceof Error ? { stack: err.stack } : {}),
  });
};
