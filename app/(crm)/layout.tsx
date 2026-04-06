import Link from "next/link";

const nav = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Students", href: "/students" },
  { label: "Applications", href: "/applications" },
  { label: "Universities", href: "/universities" },
  { label: "Agents", href: "/agents" },
  { label: "Tasks", href: "/tasks" },
  { label: "Student Requests", href: "/student-requests" },
  { label: "Pipeline Board", href: "/pipeline" },
  { label: "Audit Logs", href: "/audit-logs" },
  { label: "Scholarships", href: "/scholarships" },
  { label: "Finance", href: "/finance" },
  { label: "Settings", href: "/settings" },
  { label: "Portal", href: "/portal/dashboard" },
];

export default function CRMShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-72 border-r border-border bg-white px-6 py-8 shadow-xl">
        <div className="text-lg font-semibold text-text">Vertue CRM</div>
        <p className="mt-1 text-sm text-muted">Secure multi-tenant workspace</p>
        <nav className="mt-8 space-y-1">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-text transition hover:bg-secondary">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-white/80 px-8 py-4 backdrop-blur">
          <div>
            <div className="text-xs uppercase text-muted">Workspace</div>
            <div className="text-lg font-semibold text-text">CRM Operations</div>
          </div>
          <form action="/api/auth/logout" method="post">
            <button className="btn-ghost" type="submit">
              Logout
            </button>
          </form>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
