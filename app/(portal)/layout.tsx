export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <header className="border-b border-white/10 bg-gradient-to-r from-[#141a2c] to-[#0b1326] p-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Student Portal</h1>
            <p className="text-sm text-white/70">Track your applications across Turkey & Northern Cyprus</p>
          </div>
          <div className="text-xs uppercase tracking-[0.3em] text-white/50">Secure</div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl space-y-8 py-10 px-6">{children}</main>
    </div>
  );
}
