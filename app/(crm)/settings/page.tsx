"use client";

import { useEffect, useMemo, useState } from "react";

type Role = { id: string; name: string; permissions: string[] };
type Profile = { id: string; name: string; email: string; language: "en" | "tr" | "fa" };

const agentDefaultPermissions = [
  "students:view",
  "students:create",
  "students:update",
  "applications:view",
  "applications:create",
  "applications:update",
  "tasks:view",
  "tasks:create",
  "documents:upload",
];

const commonPermissions = [
  "students:view",
  "students:create",
  "students:update",
  "applications:view",
  "applications:create",
  "applications:update",
  "tasks:view",
  "tasks:create",
  "documents:upload",
  "universities:view",
  "payments:view",
];

export default function SettingsPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(["students:view"]);
  const [roleForm, setRoleForm] = useState({ name: "" });
  const [profileForm, setProfileForm] = useState({ name: "", language: "en", currentPassword: "", newPassword: "" });
  const [message, setMessage] = useState<string | null>(null);

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

  const agentRole = useMemo(() => roles.find((role) => role.name === "Agent"), [roles]);

  async function createRole(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: roleForm.name,
        permissions: selectedPermissions,
      }),
    });
    if (response.ok) {
      setRoleForm({ name: "" });
      setSelectedPermissions(["students:view"]);
      setMessage("Role created.");
      await load();
    }
  }

  async function updateAgentDefaults() {
    if (!agentRole) return;
    const response = await fetch(`/api/roles/${agentRole.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ permissions: agentDefaultPermissions }),
    });
    if (response.ok) {
      setMessage("Agent permissions updated.");
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
      setMessage("Profile updated.");
      await load();
    }
  }

  function togglePermission(permission: string) {
    setSelectedPermissions((prev) => (prev.includes(permission) ? prev.filter((item) => item !== permission) : [...prev, permission]));
  }

  return (
    <div className="space-y-6">
      <section className="card">
        <h1 className="text-2xl font-semibold">Settings and Role Manager</h1>
        {message ? <p className="mt-2 text-sm text-success">{message}</p> : null}
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Role manager</h2>
          <button className="btn-ghost" onClick={updateAgentDefaults} type="button">
            Apply Agent Access Preset
          </button>
        </div>
        <form className="mt-4 space-y-4" onSubmit={createRole}>
          <label className="text-sm text-muted">
            Role name
            <input className="mt-1 w-full rounded-xl border border-border px-3 py-2" value={roleForm.name} onChange={(event) => setRoleForm({ name: event.target.value })} />
          </label>
          <div>
            <p className="mb-2 text-sm text-muted">Permissions</p>
            <div className="flex flex-wrap gap-2">
              {commonPermissions.map((permission) => (
                <button
                  key={permission}
                  className={`rounded-full border px-3 py-1 text-xs ${selectedPermissions.includes(permission) ? "border-primary bg-secondary text-text" : "border-border text-muted"}`}
                  onClick={(event) => {
                    event.preventDefault();
                    togglePermission(permission);
                  }}
                  type="button"
                >
                  {permission}
                </button>
              ))}
            </div>
          </div>
          <button className="btn-solid" type="submit">
            Create role
          </button>
        </form>
        <ul className="mt-4 space-y-2">
          {roles.map((role) => (
            <li key={role.id} className="rounded-xl border border-border px-3 py-2">
              <div className="font-semibold">{role.name}</div>
              <div className="mt-1 text-xs text-muted">{role.permissions.join(", ")}</div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
