import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center space-y-12 py-20 px-6">
      <div className="space-y-6 rounded-3xl border border-border bg-white/80 p-10 shadow-2xl">
        <p className="text-sm uppercase tracking-[0.5em] text-muted">Vertue CRM</p>
        <h1 className="text-4xl font-semibold text-text">CRM University & Student Portal</h1>
        <p className="text-lg text-muted">
          Multi-tenant SaaS for agents, admins, sub-agents and students with GDPR-safe isolation, premium UI, REST
          APIs and role-aware workflows.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="/" className="btn-solid text-base">
            Open CRM dashboard
          </Link>
          <Link href="/portal" className="btn-ghost">
            Student portal preview
          </Link>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="card">
          <p className="section-title">Infrastructure</p>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            <li>Next.js 16 App Router + Tailwind 4 premium design system</li>
            <li>Prisma ORM + PostgreSQL multi-tenant schema</li>
            <li>Bcrypt + JWT auth with HTTP-only cookies</li>
            <li>Route handlers for Students, Applications, Documents, Payments, Scholarships, Tasks</li>
          </ul>
        </div>
        <div className="card">
          <p className="section-title">Experience</p>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            <li>CRM + Student Portal shells with sidebar, topbar, notifications & banners</li>
            <li>Design tokens, cards, tables, badges, modals ready for expansion</li>
            <li>Portal includes progress, timeline, reminders & CTA actions</li>
            <li>API guard ensures tenant scoped queries + role enforcement</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
