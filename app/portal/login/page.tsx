"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PortalLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ tenantSlug: "vertue", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const response = await fetch("/api/portal/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(payload?.error ?? "Login failed");
      return;
    }
    router.push("/portal/dashboard");
  }

  return (
    <div className="mx-auto max-w-md space-y-6 rounded-3xl border border-white/20 bg-white/5 p-8 shadow-2xl">
      <div>
        <p className="text-sm uppercase tracking-[0.5em] text-white/60">Student login</p>
        <h1 className="text-3xl font-semibold text-white">Access your application journey</h1>
      </div>
      <form className="space-y-4" onSubmit={submit}>
        <label className="block text-sm text-white/70">
          Tenant slug
          <input className="mt-2 w-full rounded-xl border border-white/20 bg-transparent px-4 py-3 text-white" value={form.tenantSlug} onChange={(event) => setForm((prev) => ({ ...prev, tenantSlug: event.target.value }))} />
        </label>
        <label className="block text-sm text-white/70">
          Email
          <input type="email" className="mt-2 w-full rounded-xl border border-white/20 bg-transparent px-4 py-3 text-white" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} />
        </label>
        <label className="block text-sm text-white/70">
          Password
          <input type="password" className="mt-2 w-full rounded-xl border border-white/20 bg-transparent px-4 py-3 text-white" value={form.password} onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))} />
        </label>
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        <button type="submit" className="btn-solid w-full text-base font-semibold">
          Sign in
        </button>
      </form>
    </div>
  );
}
