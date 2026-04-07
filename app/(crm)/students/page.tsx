"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchJson } from "@/lib/client/fetch-json";

type Student = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  stage: string;
  fieldOfStudy: string;
  nationality: string;
};

type Meta = { currentPage: number; total: number; limit: number };

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<Meta>({ currentPage: 1, total: 0, limit: 20 });
  const [filters, setFilters] = useState({ q: "", stage: "", nationality: "", page: 1 });
  const [savedViews, setSavedViews] = useState<Array<{ id: string; name: string; filters: Record<string, unknown> }>>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    nationality: "",
    fieldOfStudy: "",
    englishLevel: "",
    username: "",
    password: "",
  });

  async function loadStudents() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.q) params.set("search", filters.q);
    if (filters.stage) params.set("stage", filters.stage);
    params.set("page", String(filters.page));
    params.set("limit", String(meta.limit));
    const { response, data } = await fetchJson<{ students?: Student[]; meta?: Meta; error?: string }>(`/api/students?${params.toString()}`);
    if (!response.ok) {
      setStudents([]);
      setLoading(false);
      return;
    }
    const payload = data ?? {};
    const filtered = (payload.students ?? []).filter((student) =>
      filters.nationality ? student.nationality.toLowerCase().includes(filters.nationality.toLowerCase()) : true,
    );
    setStudents(filtered);
    setMeta(payload.meta ?? meta);
    setLoading(false);
  }

  async function loadSavedViews() {
    const { response, data } = await fetchJson<{ views: Array<{ id: string; name: string; filters: Record<string, unknown> }> }>("/api/search/views");
    if (response.ok) setSavedViews(data?.views ?? []);
  }

  useEffect(() => {
    void loadStudents();
  }, [filters.q, filters.stage, filters.nationality, filters.page]);

  useEffect(() => {
    void loadSavedViews();
  }, []);

  async function createStudent(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (response.ok) {
      setForm({
        fullName: "",
        email: "",
        phone: "",
        nationality: "",
        fieldOfStudy: "",
        englishLevel: "",
        username: "",
        password: "",
      });
      await loadStudents();
    }
  }

  async function saveCurrentView() {
    const name = window.prompt("View name:", "My filter view");
    if (!name) return;
    const { response } = await fetchJson("/api/search/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, filters }),
    });
    if (response.ok) await loadSavedViews();
  }

  function applyView(view: { id: string; name: string; filters: Record<string, unknown> }) {
    setFilters({
      q: String(view.filters.q ?? ""),
      stage: String(view.filters.stage ?? ""),
      nationality: String(view.filters.nationality ?? ""),
      page: Number(view.filters.page ?? 1),
    });
  }

  return (
    <div className="space-y-6">
      <section className="card">
        <h1 className="text-2xl font-semibold">Students</h1>
        <p className="mt-2 text-sm text-muted">Advanced search, filters, and tenant-scoped student management.</p>
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold">Professional Search</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <input
            className="rounded-xl border border-border px-3 py-2 text-sm"
            placeholder="Search name/email/username..."
            value={filters.q}
            onChange={(event) => setFilters((prev) => ({ ...prev, q: event.target.value, page: 1 }))}
          />
          <select className="rounded-xl border border-border px-3 py-2 text-sm" value={filters.stage} onChange={(event) => setFilters((prev) => ({ ...prev, stage: event.target.value, page: 1 }))}>
            <option value="">All stages</option>
            <option value="LEAD">Lead</option>
            <option value="APPLIED">Applied</option>
            <option value="OFFERED">Accepted</option>
            <option value="ENROLLED">Enrolled</option>
          </select>
          <input
            className="rounded-xl border border-border px-3 py-2 text-sm"
            placeholder="Filter by nationality..."
            value={filters.nationality}
            onChange={(event) => setFilters((prev) => ({ ...prev, nationality: event.target.value, page: 1 }))}
          />
          <button className="btn-ghost" type="button" onClick={() => setFilters({ q: "", stage: "", nationality: "", page: 1 })}>
            Reset filters
          </button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button className="btn-ghost" type="button" onClick={saveCurrentView}>
            Save current view
          </button>
          {savedViews.map((view) => (
            <button key={view.id} className="rounded-full border border-border px-3 py-1 text-xs text-muted hover:bg-secondary" onClick={() => applyView(view)} type="button">
              {view.name}
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Student list</h2>
          <button className="btn-solid" type="button" onClick={() => setShowAddForm((prev) => !prev)}>
            {showAddForm ? "Close add form" : "Add student"}
          </button>
        </div>
        {showAddForm ? (
          <form className="mt-4 grid gap-3 rounded-xl border border-border p-4 md:grid-cols-2" onSubmit={createStudent}>
            {Object.entries(form).map(([key, value]) => (
              <label key={key} className="text-sm text-muted">
                {key}
                <input
                  type={key.includes("password") ? "password" : "text"}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2"
                  value={value}
                  onChange={(event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))}
                />
              </label>
            ))}
            <button className="btn-solid md:col-span-2" type="submit">
              Create student
            </button>
          </form>
        ) : null}
        {loading ? (
          <p className="mt-3 text-sm text-muted">Loading...</p>
        ) : (
          <>
            <div className="mt-4 overflow-x-auto">
              <table className="table-card">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Nationality</th>
                    <th>Stage</th>
                    <th>Field</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td>
                        <Link href={`/students/${student.id}`} className="text-primary underline">
                          {student.fullName}
                        </Link>
                      </td>
                      <td>{student.email}</td>
                      <td>{student.phone}</td>
                      <td>{student.nationality}</td>
                      <td>{student.stage}</td>
                      <td>{student.fieldOfStudy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-muted">
                Page {meta.currentPage} • Total {meta.total}
              </p>
              <div className="flex gap-2">
                <button className="btn-ghost" type="button" disabled={filters.page <= 1} onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}>
                  Previous
                </button>
                <button className="btn-ghost" type="button" disabled={filters.page * meta.limit >= meta.total} onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}>
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
