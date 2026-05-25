# Smart Earning Pro - Frontend

Next.js 14 (App Router) frontend with Tailwind, Better Auth, atomic components, and role-aware dashboards.

```text
frontend/src/
├── app/
│   ├── layout.tsx               # Root layout + <Providers>
│   ├── globals.css
│   ├── (marketing)/             # Public site (Navbar + Footer)
│   │   ├── page.tsx             # Landing (hero, features, courses, lead form, testimonials, FAQ)
│   │   ├── courses/page.tsx     # Catalog
│   │   ├── courses/[slug]/page.tsx
│   │   ├── about/page.tsx
│   │   └── contact/page.tsx
│   ├── (auth)/                  # Login + Register
│   ├── (dashboard)/             # Role-gated, sidebar layout
│   │   ├── student/...
│   │   ├── staff/...
│   │   ├── admin/...
│   │   │   ├── leads/page.tsx
│   │   │   ├── courses/page.tsx
│   │   │   └── users/page.tsx
│   │   └── super-admin/
│   └── api/auth/[...all]/route.ts
├── components/
│   ├── atoms/                   # Button, Input, Textarea, Select, Label, Badge, Spinner
│   ├── molecules/               # FormField, CourseCard, FeatureCard, StatCard, EmptyState
│   ├── organisms/               # Navbar, Footer, LeadForm, CourseGrid, CourseFilters, DataTable, DashboardSidebar
│   ├── providers/               # Providers wrapper (Auth + Toast)
│   └── templates/               # Marketing, Dashboard, Auth layouts
├── context/                     # AuthContext, ToastContext
├── hooks/                       # useAuth, useCourses, useLeads
├── lib/
│   ├── auth.ts                  # Better Auth server instance
│   ├── auth-client.ts           # React client
│   ├── api.ts                   # Fetch wrapper (bearer token forwarding, error normalisation)
│   ├── session.ts               # getServerSession + requireSessionRole
│   ├── utils.ts                 # cn, formatters
│   └── services/                # SSR fetchers for courses / leads / users
├── middleware.ts                # Cookie-based route guard for /student, /staff, /admin, /super-admin
└── types/index.ts               # Domain types mirrored from backend
```

## Scripts

```bash
npm run dev          # Next dev on :3000
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint
npm run type-check   # tsc --noEmit
```

## How auth flows

1. The browser hits `/login` or `/register` — these pages call Better Auth via `@/lib/auth-client`.
2. Better Auth handles the request at `/api/auth/[...all]/route.ts` and writes the session into MongoDB.
3. Every Server Component that needs a user calls `getServerSession()` (`src/lib/session.ts`), which forwards the cookie to Better Auth and returns a normalised `User`.
4. Server-side API calls to Express are routed through `@/lib/api`, which automatically forwards the cookie + bearer token for the current request.
5. Client-side API calls do the same automatically via `credentials: 'include'`.

## Atomic component conventions

- **Atoms** are pure visual primitives (buttons, inputs, labels). No data fetching.
- **Molecules** combine 2–3 atoms with a single responsibility (`FormField`, `CourseCard`).
- **Organisms** are full UI sections with their own state (`LeadForm`, `Navbar`).
- **Templates** define page chrome (`MarketingLayout`, `DashboardLayout`, `AuthLayout`).

## Design tokens

All defined in `tailwind.config.ts` under `theme.extend.colors.brand.*`, `accent.*`, `ink.*`, and `surface.*`. Components reference these tokens (never raw hex), which keeps the design coherent and makes future theming trivial.

## Adding a new dashboard page

1. Create `src/app/(dashboard)/<role>/<feature>/page.tsx`.
2. Call `await requireSessionRole('admin' /* etc. */)` at the top of the page to enforce role-based access.
3. Use the `DashboardLayout` template + atomic components for visual consistency.
