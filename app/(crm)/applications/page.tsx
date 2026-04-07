"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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
    const response = await fetch("/api/applications");
    const payload = (await response.json()) as { applications: Application[] };
    setApplications(payload.applications ?? []);
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
                  <td>{application.status}</td>
                  <td>{application.intake}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
