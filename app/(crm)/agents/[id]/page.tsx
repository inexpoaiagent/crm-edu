"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchJson } from "@/lib/client/fetch-json";

type UserRecord = {
  id: string;
  name: string;
  email: string;
  status: "ACTIVE" | "INACTIVE" | "PENDING" | "SUSPENDED";
  role: string;
};

export default function AgentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<UserRecord | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [form, setForm] = useState({ name: "", email: "" });

  async function load() {
    const { response, data } = await fetchJson<{ user?: UserRecord }>(`/api/users/${id}`);
    if (!response.ok || !data?.user) return;
    setUser(data.user);
    setForm({ name: data.user.name, email: data.user.email });
  }

  useEffect(() => {
    void load();
  }, [id]);

  async function updateStatus(status: UserRecord["status"]) {
    await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await load();
  }

  async function resetPassword() {
    if (!newPassword) return;
    await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPassword }),
    });
    setNewPassword("");
  }

  async function saveProfile() {
    await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, email: form.email }),
    });
    await load();
  }

  async function deleteAgent() {
    const response = await fetch(`/api/users/${id}`, { method: "DELETE" });
    if (response.ok) router.push("/agents");
  }

  if (!user) return <div className="card">Loading account...</div>;

  return (
    <div className="space-y-6">
      <section className="card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">{user.name}</h1>
            <p className="mt-2 text-sm text-muted">
              {user.email} | {user.role}
            </p>
            <p className="mt-1 text-sm text-muted">Status: {user.status}</p>
          </div>
          <button className="btn-ghost text-danger" type="button" onClick={deleteAgent}>
            Delete agent
          </button>
        </div>
      </section>
      <section className="card">
        <h2 className="text-lg font-semibold">Account controls</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="text-sm text-muted">
            Name
            <input className="mt-1 w-full rounded-xl border border-border px-3 py-2" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
          </label>
          <label className="text-sm text-muted">
            Email
            <input className="mt-1 w-full rounded-xl border border-border px-3 py-2" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} />
          </label>
        </div>
        <div className="mt-3">
          <button className="btn-solid" type="button" onClick={saveProfile}>
            Save profile
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button className="btn-ghost" type="button" onClick={() => updateStatus("ACTIVE")}>
            Activate
          </button>
          <button className="btn-ghost" type="button" onClick={() => updateStatus("INACTIVE")}>
            Deactivate
          </button>
          <button className="btn-ghost" type="button" onClick={() => updateStatus("SUSPENDED")}>
            Suspend
          </button>
        </div>
        <div className="mt-4 flex gap-2">
          <input
            type="password"
            className="w-full rounded-xl border border-border px-3 py-2"
            placeholder="New password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />
          <button className="btn-solid" type="button" onClick={resetPassword}>
            Reset password
          </button>
        </div>
      </section>
    </div>
  );
}
