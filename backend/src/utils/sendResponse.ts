/**
 * Standardised API response envelope. Every successful endpoint returns
 * `{ success, statusCode, message, data, meta? }` so frontend code only ever
 * needs one parser.
 */
import type { Response } from 'express';

export interface ResponseMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  [key: string]: unknown;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: ResponseMeta;
}

interface SendResponseArgs<T> {
  statusCode?: number;
  message?: string;
  data: T;
  meta?: ResponseMeta;
}

export const sendResponse = <T>(res: Response, payload: SendResponseArgs<T>): Response => {
  const { statusCode = 200, message = 'Success', data, meta } = payload;
  const body: ApiResponse<T> = {
    success: statusCode < 400,
    statusCode,
    message,
    data,
    ...(meta ? { meta } : {}),
  };
  return res.status(statusCode).json(body);
};
