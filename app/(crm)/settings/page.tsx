"use client";

import { useEffect, useState } from "react";

type Role = { id: string; name: string; permissions: string[] };
type Profile = { id: string; name: string; email: string; language: "en" | "tr" | "fa" };

export default function SettingsPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roleForm, setRoleForm] = useState({ name: "", permissions: "students:view" });
  const [profileForm, setProfileForm] = useState({ name: "", language: "en", currentPassword: "", newPassword: "" });

  async function load() {
    const [rolesRes, profileRes] = await Promise.all([fetch("/api/roles"), fetch("/api/settings/profile")]);
    const rolePayload = (await rolesRes.json()) as { roles: Role[] };
    const profilePayload = (await profileRes.json()) as { profile: Profile };
    setRoles(rolePayload.roles ?? []);
    setProfile(profilePayload.profile);
    setProfileForm((prev) => ({
      ...prev,
      name: profilePayload.profile?.name ?? "",
      language: profilePayload.profile?.language ?? "en",
    }));
  }

  useEffect(() => {
    void load();
  }, []);

  async function createRole(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: roleForm.name,
        permissions: roleForm.permissions.split(",").map((item) => item.trim()).filter(Boolean),
      }),
    });
    if (response.ok) {
      setRoleForm({ name: "", permissions: "students:view" });
      await load();
    }
  }

  async function updateProfile(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/settings/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profileForm),
    });
    if (response.ok) {
      setProfileForm((prev) => ({ ...prev, currentPassword: "", newPassword: "" }));
      await load();
    }
  }

  return (
    <div className="space-y-6">
      <section className="card">
        <h1 className="text-2xl font-semibold">Settings and role manager</h1>
      </section>
      <section className="card">
        <h2 className="text-lg font-semibold">Profile</h2>
        {profile ? <p className="mt-2 text-sm text-muted">{profile.email}</p> : null}
        <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={updateProfile}>
          <label className="text-sm text-muted">
            Name
            <input className="mt-1 w-full rounded-xl border border-border px-3 py-2" value={profileForm.name} onChange={(event) => setProfileForm((prev) => ({ ...prev, name: event.target.value }))} />
          </label>
          <label className="text-sm text-muted">
            Language
            <select className="mt-1 w-full rounded-xl border border-border px-3 py-2" value={profileForm.language} onChange={(event) => setProfileForm((prev) => ({ ...prev, language: event.target.value }))}>
              <option value="en">English</option>
              <option value="tr">Turkish</option>
              <option value="fa">Persian</option>
            </select>
          </label>
          <label className="text-sm text-muted">
            Current password
            <input type="password" className="mt-1 w-full rounded-xl border border-border px-3 py-2" value={profileForm.currentPassword} onChange={(event) => setProfileForm((prev) => ({ ...prev, currentPassword: event.target.value }))} />
          </label>
          <label className="text-sm text-muted">
            New password
            <input type="password" className="mt-1 w-full rounded-xl border border-border px-3 py-2" value={profileForm.newPassword} onChange={(event) => setProfileForm((prev) => ({ ...prev, newPassword: event.target.value }))} />
          </label>
          <button className="btn-solid md:col-span-2" type="submit">
            Update profile
          </button>
        </form>
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold">Role manager</h2>
        <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={createRole}>
          <label className="text-sm text-muted">
            Role name
            <input className="mt-1 w-full rounded-xl border border-border px-3 py-2" value={roleForm.name} onChange={(event) => setRoleForm((prev) => ({ ...prev, name: event.target.value }))} />
          </label>
          <label className="text-sm text-muted">
            Permissions (comma separated)
            <input className="mt-1 w-full rounded-xl border border-border px-3 py-2" value={roleForm.permissions} onChange={(event) => setRoleForm((prev) => ({ ...prev, permissions: event.target.value }))} />
          </label>
          <button className="btn-solid md:col-span-2" type="submit">
            Create role
          </button>
        </form>
        <ul className="mt-4 space-y-2">
          {roles.map((role) => (
            <li key={role.id} className="rounded-xl border border-border px-3 py-2">
              <div className="font-semibold">{role.name}</div>
              <div className="text-xs text-muted">{role.permissions.join(", ")}</div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
