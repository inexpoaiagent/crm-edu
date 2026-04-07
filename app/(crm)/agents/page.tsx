"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchJson } from "@/lib/client/fetch-json";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
};

type RoleOption = { id: string; name: string };

export default function AgentsPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", roleId: "" });

  async function load() {
    const [usersRes, rolesRes] = await Promise.all([
      fetchJson<{ users?: UserRow[]; error?: string }>("/api/users"),
      fetchJson<{ roles?: RoleOption[]; error?: string }>("/api/roles"),
    ]);

    if (!usersRes.response.ok) {
      setError(usersRes.data?.error ?? "Failed to load users.");
      setUsers([]);
    } else {
      setUsers(usersRes.data?.users ?? []);
      setError(null);
    }

    if (rolesRes.response.ok) {
      const fetchedRoles = rolesRes.data?.roles ?? [];
      setRoles(fetchedRoles);
      if (!form.roleId && fetchedRoles.length) {
        const defaultRole = fetchedRoles.find((role) => role.name === "Agent") ?? fetchedRoles[0];
        setForm((prev) => ({ ...prev, roleId: defaultRole.id }));
      }
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function createUser(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (response.ok) {
      setForm({ name: "", email: "", password: "", roleId: form.roleId });
      await load();
    }
  }

  async function deleteUser(userId: string) {
    const confirmed = window.confirm("Delete this user?");
    if (!confirmed) return;
    const { response } = await fetchJson(`/api/users/${userId}`, { method: "DELETE" });
    if (response.ok) await load();
  }

  function statusBadgeClass(status: string) {
    if (status === "ACTIVE") return "status-enrolled";
    if (status === "PENDING") return "status-applied";
    return "status-lead";
  }

  return (
    <div className="space-y-6">
      <section className="card">
        <h1 className="text-2xl font-semibold">Agent and admin management</h1>
        {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
      </section>
      <section className="card">
        <h2 className="text-lg font-semibold">Create account</h2>
        <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={createUser}>
          <label className="text-sm text-muted">
            Name
            <input className="mt-1 w-full rounded-xl border border-border px-3 py-2" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
          </label>
          <label className="text-sm text-muted">
            Email
            <input type="email" className="mt-1 w-full rounded-xl border border-border px-3 py-2" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} />
          </label>
          <label className="text-sm text-muted">
            Password
            <input type="password" className="mt-1 w-full rounded-xl border border-border px-3 py-2" value={form.password} onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))} />
          </label>
          <label className="text-sm text-muted">
            Role
            <select className="mt-1 w-full rounded-xl border border-border px-3 py-2" value={form.roleId} onChange={(event) => setForm((prev) => ({ ...prev, roleId: event.target.value }))}>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </label>
          <button className="btn-solid md:col-span-2" type="submit">
            Create user
          </button>
        </form>
      </section>

      <section className="card">
        <div className="overflow-x-auto">
          <table className="table-card">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <Link href={`/agents/${user.id}`} className="text-primary underline">
                      {user.name}
                    </Link>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <span className={`status-badge ${statusBadgeClass(user.status)}`}>{user.status}</span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Link href={`/agents/${user.id}`} className="btn-ghost px-2 py-1 text-xs">
                        Edit
                      </Link>
                      <button className="btn-ghost px-2 py-1 text-xs text-danger" type="button" onClick={() => deleteUser(user.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
