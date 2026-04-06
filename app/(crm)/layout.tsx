import Link from "next/link";

const nav = [
  { label: "Dashboard", href: "/" },
  { label: "Students", href: "/students" },
  { label: "Applications", href: "/applications" },
  { label: "Universities", href: "/universities" },
  { label: "Tasks", href: "/tasks" },
  { label: "Portal", href: "/portal" },
];

export default function CRMShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-72 bg-white/90 border-r border-border px-6 py-8 shadow-xl backdrop-blur">
        <div className="text-lg font-semibold text-text">Vertue CRM</div>
        <p className="text-sm text-muted mt-1">Secure multi-tenant workspace</p>
        <nav className="mt-10 space-y-2">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-text transition hover:bg-secondary"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-10">
          <div className="text-xs uppercase tracking-widest text-muted">Tenant</div>
          <div className="mt-2 text-sm font-medium">Vertue Int&rsquo;l</div>
          <div className="text-xs text-muted">Turkey · Northern Cyprus</div>
        </div>
      </aside>
      <div className="flex-1">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-white/70 px-8 py-4 backdrop-blur">
          <div>
            <div className="text-xs uppercase text-muted">Workspace</div>
            <div className="text-lg font-semibold text-text">CRM Operations</div>
          </div>
          <div className="flex items-center gap-4">
            <button className="btn-ghost">Search</button>
            <button className="btn-ghost">Notifications</button>
            <div className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-text">Vertue Admin</div>
          </div>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
