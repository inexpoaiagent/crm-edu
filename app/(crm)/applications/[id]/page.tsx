"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchJson } from "@/lib/client/fetch-json";

type Application = {
  id: string;
  program: string;
  intake: string;
  status: string;
  notes?: string;
  student: { fullName: string };
  university: { name: string };
};

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [form, setForm] = useState({ program: "", intake: "", status: "DRAFT", notes: "" });

  useEffect(() => {
    if (!id) return;
    void (async () => {
      const { response, data } = await fetchJson<{ application?: Application }>(`/api/applications/${id}`);
      if (!response.ok || !data?.application) return;
      setApplication(data.application);
      setForm({
        program: data.application.program ?? "",
        intake: data.application.intake ?? "",
        status: data.application.status ?? "DRAFT",
        notes: data.application.notes ?? "",
      });
    })();
  }, [id]);

  async function saveApplication() {
    const response = await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!response.ok) return;
    const { data } = await fetchJson<{ application?: Application }>(`/api/applications/${id}`);
    if (data?.application) setApplication(data.application);
  }

  async function deleteApplication() {
    const response = await fetch(`/api/applications/${id}`, { method: "DELETE" });
    if (response.ok) router.push("/applications");
  }

  if (!application) return <div className="card">Loading application...</div>;

  return (
    <div className="card space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{application.program}</h1>
          <p className="text-sm text-muted">Student: {application.student?.fullName}</p>
          <p className="text-sm text-muted">University: {application.university?.name}</p>
        </div>
        <button className="btn-ghost text-danger" type="button" onClick={deleteApplication}>
          Delete application
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm text-muted">
          Program
          <input className="mt-1 w-full rounded-xl border border-border px-3 py-2" value={form.program} onChange={(event) => setForm((prev) => ({ ...prev, program: event.target.value }))} />
        </label>
        <label className="text-sm text-muted">
          Intake
          <input className="mt-1 w-full rounded-xl border border-border px-3 py-2" value={form.intake} onChange={(event) => setForm((prev) => ({ ...prev, intake: event.target.value }))} />
        </label>
        <label className="text-sm text-muted">
          Status
          <select className="mt-1 w-full rounded-xl border border-border px-3 py-2" value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}>
            <option value="DRAFT">DRAFT</option>
            <option value="SUBMITTED">SUBMITTED</option>
            <option value="OFFERED">OFFERED</option>
            <option value="ENROLLED">ENROLLED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </label>
        <label className="text-sm text-muted md:col-span-2">
          Notes
          <textarea className="mt-1 w-full rounded-xl border border-border px-3 py-2" value={form.notes} onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))} />
        </label>
      </div>
      <div>
        <button className="btn-solid" type="button" onClick={saveApplication}>
          Save changes
        </button>
      </div>
    </div>
  );
}
