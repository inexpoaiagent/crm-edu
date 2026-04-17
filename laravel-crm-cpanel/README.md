# Vertue CRM (Laravel, cPanel-ready)

Production-focused multi-tenant CRM + Student Portal backend/web app for international student recruitment agencies.

## Stack
- Laravel 10 (PHP 8.1+)
- MySQL
- JWT auth + bcrypt
- Blade UI (modern, contrast-optimized, dark mode-ready)

## Default Super Admin
- Email: `admincrm@vertue.com`
- Password: `Vertue2026`

## Key Features Included
- Multi-tenant model with `tenant_id` enforced in controllers/queries
- Role-based access (SuperAdmin/Admin/Agent/SubAgent/Student)
- Dynamic permission model (`roles`, `permissions`, `role_permissions`)
- Student, University, Application, Agent/User CRUD
- Student Requests flow with Approve / Reject / More info
- Dashboard hero + KPI cards + pipeline section
- Pipeline intelligence fields (`enroll_probability`, explainability, best next action)
- SLA automation command (`crm:sla-check`) for stale/overdue work
- Multi-language files (`en`, `tr`, `fa`)
- Multi-currency fields (USD/EUR/TRY)
- Audit log table and event writes

## Database
Import:
- `database/schema-and-seed.sql`

This SQL:
- Clears previous tables
- Creates all schema
- Inserts seed users/roles/permissions/students/applications
- Inserts requested university dataset baseline (Acibadem, Altinbas, Antalya Bilim, Istanbul Atlas, Near East, EMU)

## cPanel Deployment (No SSH)
See:
- `DEPLOY-CPANEL.md`

