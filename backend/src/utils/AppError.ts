/**
 * Domain error type. Anything thrown that isn't an AppError is treated as a
 * 500 by the global error handler. Use AppError to communicate user-safe
 * messages and explicit HTTP status codes from services & controllers.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(message: string, statusCode = 500, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.isOperational = true;
    this.details = details;
    Error.captureStackTrace?.(this, this.constructor);
  }
}
