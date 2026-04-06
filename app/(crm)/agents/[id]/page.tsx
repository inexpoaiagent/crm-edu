"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type UserRecord = {
  id: string;
  name: string;
  email: string;
  status: "ACTIVE" | "INACTIVE" | "PENDING" | "SUSPENDED";
  role: string;
};

export default function AgentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserRecord | null>(null);
  const [newPassword, setNewPassword] = useState("");

  async function load() {
    const response = await fetch(`/api/users/${id}`);
    const payload = (await response.json()) as { user: UserRecord };
    setUser(payload.user);
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

  if (!user) return <div className="card">Loading account...</div>;

  return (
    <div className="space-y-6">
      <section className="card">
        <h1 className="text-2xl font-semibold">{user.name}</h1>
        <p className="mt-2 text-sm text-muted">
          {user.email} | {user.role}
        </p>
        <p className="mt-1 text-sm text-muted">Status: {user.status}</p>
      </section>
      <section className="card">
        <h2 className="text-lg font-semibold">Account controls</h2>
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
