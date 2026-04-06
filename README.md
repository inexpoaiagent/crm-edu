# CRM University & Student Portal

Enterprise-ready CRM + student experience platform for international student recruitment teams operating across Turkey & Northern Cyprus. The solution is built on Next.js App Router, Prisma/PostgreSQL, Tailwind 4, and a JWT-based auth surface with tenant-aware isolation across every module.

## Highlights
- Shared database with `tenantId` enforced on every table and API.
- Role/permission framework (SuperAdmin, Admin, Agent, SubAgent, Student).
- Full auth stack with email/password login, bcrypt password hashing, JWT cookies, and secure session guards.
- Core modules: students, universities, applications, documents, payments, scholarships, tasks, notifications, audit logs.
- Multi-step CRM UI shell plus Student Portal routes built for separate experiences.
- Design tokens + premium UI system (cards, badges, typography). All CRUD operations are routed through RESTful Route Handlers.
- Seed helpers for SuperAdmin + default tenant.

## Getting started
1. Copy `.env.example` to `.env` and provide your PostgreSQL connection string plus `JWT_SECRET`.
2. Run `npm install` to restore dependencies.
3. `npx prisma migrate dev` to push the schema (requires Postgres). Alternative: `npx prisma db push` for no-migration flow.
4. (Optional) `npm run prisma:seed` to create the default tenant/role/user.
5. `npm run dev` to start Next.js locally.

## Scripts
- `npm run dev` – run the Next.js dev server.
- `npm run build` / `npm run start` – production build & start.
- `npm run lint` – ESLint check.
- `npm run format` – format code with Prettier.
- `npm run prisma:seed` – seed SuperAdmin bundle (requires `DATABASE_URL`).

## Tech stack
- **Frontend:** Next.js 16 (App Router), Tailwind CSS 4, React 19, Layout/portal split for CRM vs Student UX.
- **Backend:** Next.js route handlers, Prisma ORM, PostgreSQL datasource, JWT/bcrypt auth.
- **DevOps:** Prisma migrations, env-based configuration, heavyweight design tokens + components.

## Next steps
- Build remaining REST handlers for each module (students, applications, universities, etc.) with tenant filters.
- Implement UI dashboard + tables, portal flows, notifications, and document uploads.
- Wire up analytics & matching engine with Prisma queries and helpers.
- Set up CI/CD + database migrations.
