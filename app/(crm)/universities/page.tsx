"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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
  const [form, setForm] = useState({
    name: "",
    country: "Turkey",
    website: "",
    tuitionRange: "",
    language: "English",
    programs: "Computer Science, Business",
    deadline: "",
    description: "",
  });

  async function load() {
    const response = await fetch("/api/universities");
    const payload = (await response.json()) as { universities: University[] };
    setUniversities(payload.universities ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function createUniversity(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/universities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        deadline: form.deadline || undefined,
        programs: form.programs.split(",").map((item) => item.trim()).filter(Boolean),
      }),
    });
    if (response.ok) {
      setForm({
        name: "",
        country: "Turkey",
        website: "",
        tuitionRange: "",
        language: "English",
        programs: "Computer Science, Business",
        deadline: "",
        description: "",
      });
      await load();
    }
  }

  return (
    <div className="space-y-6">
      <section className="card">
        <h1 className="text-2xl font-semibold">Universities</h1>
        <p className="mt-2 text-sm text-muted">Premium catalog with richer details for counselors and students.</p>
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold">Add university</h2>
        <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={createUniversity}>
          {Object.entries(form).map(([key, value]) => (
            <label key={key} className="text-sm text-muted">
              {key}
              <input className="mt-1 w-full rounded-xl border border-border px-3 py-2" value={value} onChange={(event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))} />
            </label>
          ))}
          <button className="btn-solid md:col-span-2" type="submit">
            Save university
          </button>
        </form>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {universities.map((university) => (
          <article key={university.id} className="card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Link href={`/universities/${university.id}`} className="text-xl font-semibold text-text hover:underline">
                  {university.name}
                </Link>
                <p className="mt-1 text-sm text-muted">
                  {university.country} • {university.language}
                </p>
              </div>
              <span className="badge">{university.tuitionRange || "Contact"}</span>
            </div>

            <p className="mt-4 text-sm text-text">{university.description || "International-friendly university with strong admission support."}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {university.programs?.slice(0, 4).map((program) => (
                <span key={`${university.id}-${program}`} className="rounded-full border border-border px-3 py-1 text-xs text-muted">
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
        ))}
      </section>
    </div>
  );
}
