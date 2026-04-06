import Link from "next/link";

const links = [
  { href: "/portal/dashboard", label: "Dashboard" },
  { href: "/portal/universities", label: "Universities" },
  { href: "/portal/applications", label: "Applications" },
  { href: "/portal/documents", label: "Documents" },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <header className="border-b border-white/10 bg-gradient-to-r from-[#141a2c] to-[#0b1326] p-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Student Portal</h1>
            <p className="text-sm text-white/70">Track your applications across Turkey and Northern Cyprus</p>
          </div>
          <nav className="flex items-center gap-2 text-sm">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="rounded-lg border border-white/20 px-3 py-2 hover:bg-white/5">
                {link.label}
              </Link>
            ))}
            <form action="/api/portal/auth/logout" method="post">
              <button className="rounded-lg border border-white/20 px-3 py-2 hover:bg-white/5" type="submit">
                Logout
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">{children}</main>
    </div>
  );
}
