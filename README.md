# Vertue CRM + Student Portal

Production-ready multi-tenant CRM and Student Portal for international student recruitment teams in Turkey and Northern Cyprus.

## Tech Stack
- Next.js 16 (App Router) + TypeScript
- PostgreSQL + Prisma
- JWT + bcrypt authentication
- Tailwind CSS

## Default Login
> Use only for first login and rotate password after deployment.

- Tenant slug: `vertue`
- Super Admin Email: `admincrm@vertue.com`
- Super Admin Password: `Vertue2026`

## Local Setup
1. Create `.env`:
   - `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/crm_university`
   - `JWT_SECRET=<your-strong-secret>`
   - `NEXT_PUBLIC_APP_URL=http://localhost:3000`
2. Install dependencies:
   - `npm install`
3. Sync database:
   - `npx prisma db push`
4. Seed production data:
   - `npm run prisma:seed:production`
5. Run app:
   - `npm run dev`

## Useful Scripts
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run prisma:seed`
- `npm run prisma:seed:fake`
- `npm run prisma:seed:production`
