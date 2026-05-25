# Smart Earning Pro E-learning platform

A monorepo containing a Next.js 14 frontend and an Express + MongoDB backend for a high-converting lead generation and e-learning experience.

## Project structure

```text
lead_generation/
├── backend/        # Express + Mongoose API (auth / user / course / lead modules)
├── frontend/       # Next.js 14 App Router + Tailwind + Better Auth + Atomic Design
└── README.md
```

## Tech stack at a glance

- **Frontend** — Next.js 14 (App Router), Tailwind CSS, React Hook Form, Context API for state, `lucide-react` icons.
- **Backend** — Node.js + Express, layered modular architecture (`routes → controllers → services → models`), pino logging, helmet/cors hardening.
- **Database** — MongoDB via Mongoose (strict TypeScript interfaces) and the native MongoDB driver (Better Auth adapter).
- **Authentication** — [Better Auth](https://www.better-auth.com/) running inside the Next.js app, with the Express API validating the same session against the shared MongoDB so every request is universally authenticated.
- **Media uploads** — Cloudinary (streaming buffer uploads via `multer` memory storage + `streamifier`).
- **Validation** — `zod` schemas on every route + form.

## Quick start

> Requires Node 20+, npm 10+, and a MongoDB instance you can connect to (local or hosted).

### 1. Clone and prepare environment files

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Fill in:

- `MONGODB_URI` (same value in both files).
- `BETTER_AUTH_SECRET` (same value in both files — generate with `openssl rand -hex 32`).
- `CLOUDINARY_*` credentials (backend only — optional during initial scaffolding).

### 2. Install dependencies and run both apps

```bash
# Terminal 1
cd backend && npm install && npm run dev

# Terminal 2
cd frontend && npm install && npm run dev
```

- Backend listens on **http://localhost:5000** (`/api/health` for a sanity check).
- Frontend listens on **http://localhost:3000**.

### 3. Create your first super-admin

1. Visit `/register` and sign up a normal account.
2. In MongoDB, open the `user` collection and set that document's `role` field to `"super_admin"`.
3. Sign out and back in. The Super Admin dashboard at `/super-admin` is now available, and from there you can promote/demote anyone.

## Roles & route map

| Role          | Default landing | Can access                                            |
| ------------- | --------------- | ----------------------------------------------------- |
| `student`     | `/student`      | Public site + own profile + student dashboard         |
| `staff`       | `/staff`        | + `/admin/leads`, `/admin/courses` (create/edit/publish) |
| `admin`       | `/admin`        | + `/admin/users` (manage users, delete content)       |
| `super_admin` | `/super-admin`  | Everything, plus role assignment                      |

Role enforcement is layered:

1. **Edge middleware** (`frontend/src/middleware.ts`) — fast cookie-presence gate.
2. **Server Components** (`requireSessionRole`) — authoritative role check.
3. **Express API** (`requireAuth` + `requireRole`) — last line of defence.

## Highlights to explore

- `frontend/src/app/(marketing)/page.tsx` — the conversion-focused landing page (hero, social proof, features, courses, testimonials, FAQ, lead form).
- `frontend/src/components/organisms/LeadForm.tsx` — the reusable, UTM-aware lead capture form.
- `backend/src/modules/course/course.service.ts` — Cloudinary streaming uploads with rollback on DB failure.
- `backend/src/middleware/error.middleware.ts` — uniform error envelope across the whole API.

## Out of scope for the initial scaffold

- Payment processing / enrolment checkout.
- Real video streaming.
- Email + Slack notifications on lead capture (TODO hook already in place in `lead.service.ts`).
- Automated tests / CI configuration.

## License

MIT
