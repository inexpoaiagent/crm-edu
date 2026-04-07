"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchJson } from "@/lib/client/fetch-json";

type University = {
  id: string;
  name: string;
  country: string;
  language: string;
  tuitionRange?: string | null;
  website?: string | null;
  programs: string[];
  deadline?: string | null;
  description?: string | null;
};

export default function UniversitiesPage() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState({
    name: "",
    country: "Turkey",
    website: "",
    tuitionRange: "",
    tuitionCurrency: "TRY",
    language: "English",
    programs: "Computer Science, Business",
    deadline: "",
    description: "",
  });

  async function loadUniversities() {
    try {
      const { response, data } = await fetchJson<{ universities?: University[]; error?: string }>("/api/universities");
      if (!response.ok) {
        setError(data?.error || "Failed to load universities.");
        setUniversities([]);
        return;
      }
      setError(null);
      setUniversities(data?.universities ?? []);
    } catch {
      setError("Network error while loading universities.");
      setUniversities([]);
    }
  }

  useEffect(() => {
    void loadUniversities();
  }, []);

  async function createUniversity(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/universities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        country: form.country,
        website: form.website,
        tuitionRange: form.tuitionRange ? `${form.tuitionRange} ${form.tuitionCurrency}` : "",
        language: form.language,
        deadline: form.deadline || undefined,
        description: form.description,
        programs: Array.from(new Set(form.programs.split(",").map((item) => item.trim()).filter(Boolean))),
      }),
    });
    if (response.ok) {
      setForm({
        name: "",
        country: "Turkey",
        website: "",
        tuitionRange: "",
        tuitionCurrency: "TRY",
        language: "English",
        programs: "Computer Science, Business",
        deadline: "",
        description: "",
      });
      setShowAddForm(false);
      await loadUniversities();
    }
  }

  const filteredUniversities = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return universities;
    return universities.filter((university) => {
      const haystack = [
        university.name,
        university.country,
        university.language,
        university.tuitionRange || "",
        university.description || "",
        ...(university.programs ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [query, universities]);

  return (
    <div className="space-y-6">
      <section className="card">
        <h1 className="text-2xl font-semibold">Universities</h1>
        <p className="mt-2 text-sm text-muted">Premium catalog with richer details for counselors and students.</p>
        {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
      </section>

      <section className="card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">University catalog</h2>
          <div className="flex gap-2">
            <input
              className="rounded-xl border border-border px-3 py-2 text-sm"
              placeholder="Search university, country, program..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <button className="btn-solid" type="button" onClick={() => setShowAddForm((prev) => !prev)}>
              {showAddForm ? "Close add form" : "Add university"}
            </button>
          </div>
        </div>

        {showAddForm ? (
          <form className="mt-4 grid gap-3 rounded-xl border border-border p-4 md:grid-cols-2" onSubmit={createUniversity}>
            <label className="text-sm text-muted">
              name
              <input className="mt-1 w-full rounded-xl border border-border px-3 py-2" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
            </label>
            <label className="text-sm text-muted">
              country
              <select className="mt-1 w-full rounded-xl border border-border px-3 py-2" value={form.country} onChange={(event) => setForm((prev) => ({ ...prev, country: event.target.value }))}>
                <option value="Turkey">Turkey</option>
                <option value="Northern Cyprus">Northern Cyprus</option>
              </select>
            </label>
            <label className="text-sm text-muted">
              website
              <input className="mt-1 w-full rounded-xl border border-border px-3 py-2" value={form.website} onChange={(event) => setForm((prev) => ({ ...prev, website: event.target.value }))} />
            </label>
            <div className="grid gap-2 md:grid-cols-[1fr_auto]">
              <label className="text-sm text-muted">
                tuition range
                <input className="mt-1 w-full rounded-xl border border-border px-3 py-2" value={form.tuitionRange} onChange={(event) => setForm((prev) => ({ ...prev, tuitionRange: event.target.value }))} />
              </label>
              <label className="text-sm text-muted">
                currency
                <select className="mt-1 w-full rounded-xl border border-border px-3 py-2" value={form.tuitionCurrency} onChange={(event) => setForm((prev) => ({ ...prev, tuitionCurrency: event.target.value }))}>
                  <option value="TRY">TRY</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </label>
            </div>
            <label className="text-sm text-muted">
              language
              <input className="mt-1 w-full rounded-xl border border-border px-3 py-2" value={form.language} onChange={(event) => setForm((prev) => ({ ...prev, language: event.target.value }))} />
            </label>
            <label className="text-sm text-muted">
              programs (comma separated)
              <input className="mt-1 w-full rounded-xl border border-border px-3 py-2" value={form.programs} onChange={(event) => setForm((prev) => ({ ...prev, programs: event.target.value }))} />
            </label>
            <label className="text-sm text-muted">
              deadline
              <input type="date" className="mt-1 w-full rounded-xl border border-border px-3 py-2" value={form.deadline} onChange={(event) => setForm((prev) => ({ ...prev, deadline: event.target.value }))} />
            </label>
            <label className="text-sm text-muted">
              description
              <input className="mt-1 w-full rounded-xl border border-border px-3 py-2" value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} />
            </label>
            <button className="btn-solid md:col-span-2" type="submit">
              Save university
            </button>
          </form>
        ) : null}

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {filteredUniversities.map((university) => {
          const programs = Array.from(new Set(university.programs ?? [])).slice(0, 6);
          return (
            <article key={university.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link href={`/universities/${university.id}`} className="text-xl font-semibold text-text hover:underline">
                    {university.name}
                  </Link>
                  <p className="mt-1 text-sm text-muted">
                    {university.country} - {university.language}
                  </p>
                </div>
                <span className="badge">{university.tuitionRange || "Contact"}</span>
              </div>

              <p className="mt-4 text-sm text-text">{university.description || "International-friendly university with strong admission support."}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {programs.map((program, index) => (
                  <span key={`${university.id}-${program}-${index}`} className="rounded-full border border-border px-3 py-1 text-xs text-muted">
                    {program}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted">
                <span>Deadline: {university.deadline ? new Date(university.deadline).toLocaleDateString() : "Rolling"}</span>
                {university.website ? (
                  <a href={university.website} target="_blank" rel="noreferrer" className="text-primary underline">
                    Website
                  </a>
                ) : null}
              </div>
            </article>
          );
          })}
        </div>
      </section>
    </div>
  );
}
