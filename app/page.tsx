"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [form, setForm] = useState({
    tenantSlug: "vertue",
    email: "admincrm@vertue.com",
    password: "Vertue2026",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setIsLoading(false);
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? "Login failed");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center gap-8 px-6 py-12">
      <div className="card w-full max-w-xl">
        <p className="section-title">CRM login</p>
        <h1 className="mt-3 text-3xl font-semibold text-text">International Student CRM</h1>
        <p className="mt-2 text-sm text-muted">Use the default super-admin credentials or your tenant account.</p>

        <form className="mt-6 space-y-4" onSubmit={handleLogin}>
          <label className="block text-sm text-muted">
            Tenant slug
            <input
              className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-text"
              value={form.tenantSlug}
              onChange={(event) => setForm((prev) => ({ ...prev, tenantSlug: event.target.value }))}
            />
          </label>
          <label className="block text-sm text-muted">
            Email
            <input
              type="email"
              className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-text"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            />
          </label>
          <label className="block text-sm text-muted">
            Password
            <input
              type="password"
              className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-text"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            />
          </label>

          {error ? <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-danger">{error}</div> : null}

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-solid" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in to CRM"}
            </button>
            <button type="button" className="btn-ghost" onClick={() => router.push("/portal/login")}>
              Student portal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
