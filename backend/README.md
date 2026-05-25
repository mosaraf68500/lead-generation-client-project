# Smart Earning Pro - Backend

Express + MongoDB API following a strict layered architecture.

```text
backend/src/
├── app.ts                # Express composition (security -> Better Auth -> parsers -> routes -> error)
├── server.ts             # Bootstrap: db connect + port bind + graceful shutdown
├── config/               # env, db, cloudinary, auth (Better Auth shared instance)
├── middleware/           # auth, role, validate, error, notFound
├── utils/                # AppError, catchAsync, sendResponse, queryBuilder, logger
├── types/                # Express + domain types
└── modules/              # Feature modules (auth, user, course, lead)
    └── <module>/
        ├── <module>.routes.ts
        ├── <module>.controller.ts
        ├── <module>.service.ts
        ├── <module>.model.ts        (where applicable)
        ├── <module>.interface.ts    (where applicable)
        └── <module>.validation.ts
```

## Scripts

```bash
npm run dev      # ts-node-dev with reload
npm run build    # tsc -> dist
npm run start    # node dist/server.js
npm run lint     # eslint src/**/*.ts
npm run format   # prettier write
```

## Endpoints

All responses follow `{ success, statusCode, message, data, meta? }`.

### Auth (`/api/auth/*`)
Mounted by Better Auth itself. Includes `sign-in/email`, `sign-up/email`, `sign-out`, `get-session`, etc.

### Auth profile (`/api/auth-profile`)
| Method | Path        | Auth | Description                                |
| ------ | ----------- | ---- | ------------------------------------------ |
| GET    | `/me`       | yes  | Returns the enriched profile of the caller |

### Users (`/api/users`)
| Method | Path           | Auth        | Notes                                          |
| ------ | -------------- | ----------- | ---------------------------------------------- |
| GET    | `/`            | admin       | List + search + filter by role                 |
| GET    | `/me`          | any logged  | Current user profile                           |
| PATCH  | `/me`          | any logged  | Update own profile (name/phone/avatar/bio/...) |
| GET    | `/:id`         | staff+      | Inspect a single user                          |
| PATCH  | `/:id/role`    | super_admin | Promote/demote a user                          |
| DELETE | `/:id`         | admin       | Remove a user                                  |

### Courses (`/api/courses`)
| Method | Path             | Auth     | Notes                                                                 |
| ------ | ---------------- | -------- | --------------------------------------------------------------------- |
| GET    | `/`              | optional | Public list; students only see `isPublished=true` by default          |
| GET    | `/:slug`         | optional | Public detail                                                         |
| POST   | `/`              | staff+   | `multipart/form-data` with field `thumbnail` (image, max 5 MB)        |
| PATCH  | `/:id`           | staff+   | Same form-data shape, all fields optional                             |
| POST   | `/:id/publish`   | staff+   | Body `{ isPublished: boolean }`                                       |
| DELETE | `/:id`           | admin    | Removes the course + its Cloudinary asset                             |

### Leads (`/api/leads`)
| Method | Path                | Auth   | Notes                                                                  |
| ------ | ------------------- | ------ | ---------------------------------------------------------------------- |
| POST   | `/`                 | public | Public capture endpoint used by the landing/contact forms              |
| GET    | `/`                 | staff+ | Paginated + filterable (status, source, interestedCourse)              |
| GET    | `/:id`              | staff+ |                                                                        |
| PATCH  | `/:id/status`       | staff+ | Body `{ status: 'new' | 'contacted' | 'qualified' | 'converted' | 'rejected' }` |
| DELETE | `/:id`              | admin  |                                                                        |

## Auth deep-dive

Better Auth is mounted in TWO places:

1. In the Next.js app at `/api/auth/*` — it's the canonical UI host.
2. In Express at the same path via `toNodeHandler(auth)` — provides parity for non-browser callers if needed.

Both runtimes share:
- The **same** `BETTER_AUTH_SECRET`.
- The **same** MongoDB database.

Express validates every request via `auth.api.getSession({ headers: fromNodeHeaders(req.headers) })`. The Next.js frontend forwards the session cookie AND a `Authorization: Bearer <token>` header (issued by the `bearer` plugin) so both cookie and token strategies work seamlessly.

## Adding a new module

1. Create `src/modules/<name>/` with `routes`, `controller`, `service`, `model`, `interface`, `validation` files.
2. Register the router in `src/app.ts`:

   ```ts
   app.use('/api/<name>', <name>Router);
   ```

3. Re-export shared types under `src/types/` if other modules need them.
