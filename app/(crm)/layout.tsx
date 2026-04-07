import Link from "next/link";
import TopbarActions from "./_components/topbar-actions";
import CrmAuthGate from "./_components/crm-auth-gate";

const nav = [
  { label: "Dashboard", href: "/dashboard", icon: "D" },
  { label: "Students", href: "/students", icon: "S" },
  { label: "Applications", href: "/applications", icon: "A" },
  { label: "Universities", href: "/universities", icon: "U" },
  { label: "Agents", href: "/agents", icon: "G" },
  { label: "Tasks", href: "/tasks", icon: "T" },
  { label: "Student Requests", href: "/student-requests", icon: "R" },
  { label: "Pipeline Board", href: "/pipeline", icon: "P" },
  { label: "Audit Logs", href: "/audit-logs", icon: "L" },
  { label: "Scholarships", href: "/scholarships", icon: "H" },
  { label: "Finance", href: "/finance", icon: "F" },
  { label: "Settings", href: "/settings", icon: "C" },
  { label: "Portal", href: "/portal/dashboard", icon: "O" },
];

export default function CRMShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="crm-layout flex min-h-screen">
      <CrmAuthGate />
      <aside className="crm-sidebar w-72 border-r border-border bg-white px-6 py-8 shadow-xl">
        <div className="text-lg font-semibold text-text">Vertue CRM</div>
        <p className="mt-1 text-sm text-muted">Secure multi-tenant workspace</p>
        <nav className="mt-8 space-y-1">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="crm-nav-link flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-text transition hover:bg-secondary">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-secondary text-[10px] font-semibold text-primary">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1">
        <header className="crm-header sticky top-0 z-10 flex items-center justify-between border-b border-border bg-white/80 px-8 py-4 backdrop-blur">
          <div>
            <div className="text-xs uppercase text-muted">Workspace</div>
            <div className="text-lg font-semibold text-text">CRM Operations</div>
          </div>
          <TopbarActions />
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
