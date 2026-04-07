# CRM University & Student Portal

Enterprise-ready CRM + Student Portal platform for international student recruitment teams operating across Turkey and Northern Cyprus. Built with Next.js App Router, Prisma/PostgreSQL, Tailwind CSS, and JWT-based authentication with strict tenant isolation.

## Highlights
- Multi-tenant architecture with `tenantId` enforcement across all core tables and APIs
- Role and permission framework: `SuperAdmin`, `Admin`, `Agent`, `SubAgent`, `Student`
- Secure auth stack: email/password, bcrypt hashing, JWT cookie sessions, route protection middleware
- Full CRM modules: students, universities, applications, documents, payments, scholarships, tasks, notifications, audit logs
- Separate Student Portal experience with dedicated routes and API handlers
- Modern UI system (cards, badges, responsive tables, filters, pipeline views)
- Production seed support for base tenant, users, universities, and operational data

## Default Login
> For initial setup only. Rotate credentials after deployment.

- Tenant slug: `vertue`
- Super Admin Email: `admincrm@vertue.com`
- Super Admin Password: `Vertue2026`

## Getting Started
1. Create `.env` (or copy from `.env.example` if present):
   - `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/crm_university`
   - `JWT_SECRET=<your-strong-secret>`
   - `NEXT_PUBLIC_APP_URL=http://localhost:3000`
2. Install dependencies:
   - `npm install`
3. Sync database schema:
   - `npx prisma db push`
4. Seed data:
   - Base seed: `npm run prisma:seed`
   - Fake seed (optional): `npm run prisma:seed:fake`
   - Production seed (recommended): `npm run prisma:seed:production`
5. Run development server:
   - `npm run dev`

## Scripts
- `npm run dev` - Start Next.js dev server
- `npm run build` - Create production build
- `npm run start` - Run production server
- `npm run lint` - Run ESLint
- `npm run format` - Run Prettier
- `npm run prisma:seed` - Seed default tenant and admin
- `npm run prisma:seed:fake` - Seed fake development dataset
- `npm run prisma:seed:production` - Reset and seed production-ready initial dataset

## Tech Stack
- Frontend: Next.js 16 (App Router), React 19, Tailwind CSS 4, TypeScript (strict)
- Backend: Next.js Route Handlers, Prisma ORM, PostgreSQL
- Auth & Security: JWT session cookies, bcrypt, middleware and guard-based authorization
- Data Model: Tenant-scoped CRM entities with role-aware access controls

## Notes
- All protected APIs require a valid CRM session.
- If data does not load after reseed/reset, logout and login again to refresh session context.
- `prisma:seed:production` is destructive by design (it clears existing CRM data before inserting production seed data).


## Screenshots

### Dashboard
![Dashboard](screenshots/01-dashboard.png)

### Students
![Students](screenshots/02-students.png)

### Applications
![Applications](screenshots/0-3applications.png)

### Universiteis
![Universiteis](screenshots/04-universiteis.png)

### Pipeline
![Pipeline](screenshots/05-pipeline.png)

### Settings
![Settings](screenshots/06-settings.png)