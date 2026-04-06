export default function PortalLoginPage() {
  return (
    <div className="mx-auto max-w-md space-y-6 rounded-3xl border border-white/20 bg-white/5 p-8 shadow-2xl">
      <div>
        <p className="text-sm uppercase tracking-[0.5em] text-white/60">Student login</p>
        <h1 className="text-3xl font-semibold text-white">Access your application journey</h1>
      </div>
      <form className="space-y-4">
        <label className="block text-sm text-white/70">
          Email
          <input type="email" placeholder="student@email.com" className="mt-2 w-full rounded-xl border border-white/20 bg-transparent px-4 py-3 text-white" />
        </label>
        <label className="block text-sm text-white/70">
          Password
          <input type="password" placeholder="••••••" className="mt-2 w-full rounded-xl border border-white/20 bg-transparent px-4 py-3 text-white" />
        </label>
        <button type="submit" className="btn-solid w-full text-base font-semibold">
          Sign in
        </button>
      </form>
    </div>
  );
}
