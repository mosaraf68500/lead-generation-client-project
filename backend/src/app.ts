/**
 * Express app composition.
 *
 * Order matters:
 *   1. Security/parsing middleware
 *   2. Better Auth handler (mounted RAW because it owns its own body parsing)
 *   3. JSON / cookie / URL body parsers for the rest of the API
 *   4. Domain routers
 *   5. 404 + global error handler (always last)
 */
import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { toNodeHandler } from 'better-auth/node';
import { env } from './config/env';
import { auth } from './config/auth';
import { authRouter } from './modules/auth/auth.routes';
import { userRouter } from './modules/user/user.routes';
import { courseRouter } from './modules/course/course.routes';
import { leadRouter } from './modules/lead/lead.routes';
import { notFoundHandler } from './middleware/notFound.middleware';
import { errorHandler } from './middleware/error.middleware';

const app: Express = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(
  cors({
    origin: env.TRUSTED_ORIGINS,
    credentials: true,
  }),
);
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

/**
 * Better Auth ships its own routing and reads the raw body itself, so mount
 * BEFORE express.json(). The Next.js app is the canonical host for these
 * routes; the Express mount exists for parity (e.g. health checks, bots) and
 * is useful if you ever decommission the Next host.
 */
app.all('/api/auth/*', toNodeHandler(auth));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// Health check.
app.get('/api/health', (_req, res) => {
  res.json({ success: true, statusCode: 200, message: 'OK', data: { uptime: process.uptime() } });
});

// Domain modules.
app.use('/api/auth-profile', authRouter);
app.use('/api/users', userRouter);
app.use('/api/courses', courseRouter);
app.use('/api/leads', leadRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export { app };
