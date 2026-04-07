"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchJson } from "@/lib/client/fetch-json";

type Application = {
  id: string;
  program: string;
  intake: string;
  status: string;
  student: { fullName: string };
  university: { name: string };
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState({
    studentId: "",
    universityId: "",
    program: "",
    intake: "",
    status: "DRAFT",
  });

  async function load() {
    const { response, data } = await fetchJson<{ applications?: Application[]; error?: string }>("/api/applications");
    if (!response.ok) {
      setError(data?.error ?? "Failed to load applications.");
      setApplications([]);
      return;
    }
    setError(null);
    setApplications(data?.applications ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function createApplication(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (response.ok) {
      setForm({ studentId: "", universityId: "", program: "", intake: "", status: "DRAFT" });
      setShowAddForm(false);
      await load();
    }
  }

  async function deleteApplication(id: string) {
    const confirmed = window.confirm("Delete this application?");
    if (!confirmed) return;
    const { response } = await fetchJson(`/api/applications/${id}`, { method: "DELETE" });
    if (response.ok) await load();
  }

  function statusBadgeClass(status: string) {
    const key = status.toUpperCase();
    if (key === "LEAD") return "status-lead";
    if (key === "APPLIED") return "status-applied";
    if (key === "OFFERED" || key === "ACCEPTED") return "status-offered";
    if (key === "ENROLLED") return "status-enrolled";
    return "";
  }

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return applications;
    return applications.filter(
      (application) =>
        application.program.toLowerCase().includes(term) ||
        application.intake.toLowerCase().includes(term) ||
        (application.student?.fullName || "").toLowerCase().includes(term) ||
        (application.university?.name || "").toLowerCase().includes(term),
    );
  }, [applications, query]);

  return (
    <div className="space-y-6">
      <section className="card">
        <h1 className="text-2xl font-semibold">Applications</h1>
        {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
      </section>

      <section className="card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Applications list</h2>
          <div className="flex gap-2">
            <input
              className="rounded-xl border border-border px-3 py-2 text-sm"
              placeholder="Search applications..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <button className="btn-solid" type="button" onClick={() => setShowAddForm((prev) => !prev)}>
              {showAddForm ? "Close add form" : "Add application"}
            </button>
          </div>
        </div>

        {showAddForm ? (
          <form className="mt-4 grid gap-3 rounded-xl border border-border p-4 md:grid-cols-2" onSubmit={createApplication}>
            {Object.entries(form).map(([key, value]) => (
              <label key={key} className="text-sm text-muted">
                {key}
                <input className="mt-1 w-full rounded-xl border border-border px-3 py-2" value={value} onChange={(event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))} />
              </label>
            ))}
            <button className="btn-solid md:col-span-2" type="submit">
              Save application
            </button>
          </form>
        ) : null}

        <div className="mt-4 overflow-x-auto">
          <table className="table-card">
            <thead>
              <tr>
                <th>Program</th>
                <th>Student</th>
                <th>University</th>
                <th>Status</th>
                <th>Intake</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((application) => (
                <tr key={application.id}>
                  <td>
                    <Link href={`/applications/${application.id}`} className="text-primary underline">
                      {application.program}
                    </Link>
                  </td>
                  <td>{application.student?.fullName}</td>
                  <td>{application.university?.name}</td>
                  <td>
                    <span className={`status-badge ${statusBadgeClass(application.status)}`}>{application.status}</span>
                  </td>
                  <td>{application.intake}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Link className="btn-ghost px-2 py-1 text-xs" href={`/applications/${application.id}`}>
                        Edit
                      </Link>
                      <button className="btn-ghost px-2 py-1 text-xs text-danger" type="button" onClick={() => deleteApplication(application.id)}>
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
