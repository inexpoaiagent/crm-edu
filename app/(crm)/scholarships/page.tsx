"use client";

import { useEffect, useState } from "react";

type Scholarship = {
  id: string;
  title: string;
  discountPercentage: number;
  university: { name: string };
};

type University = { id: string; name: string };

export default function ScholarshipsPage() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [form, setForm] = useState({ title: "", universityId: "", discountPercentage: "10", description: "" });

  async function load() {
    const [scholarshipRes, universityRes] = await Promise.all([fetch("/api/scholarships"), fetch("/api/universities")]);
    const scholarshipPayload = (await scholarshipRes.json()) as { scholarships: Scholarship[] };
    const universityPayload = (await universityRes.json()) as { universities: University[] };
    setScholarships(scholarshipPayload.scholarships ?? []);
    setUniversities(universityPayload.universities ?? []);
    if (!form.universityId && universityPayload.universities?.length) {
      setForm((prev) => ({ ...prev, universityId: universityPayload.universities[0].id }));
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function createScholarship(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/scholarships", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        discountPercentage: Number(form.discountPercentage),
      }),
    });
    if (response.ok) {
      setForm((prev) => ({ ...prev, title: "", discountPercentage: "10", description: "" }));
      await load();
    }
  }

  return (
    <div className="space-y-6">
      <section className="card">
        <h1 className="text-2xl font-semibold">Scholarships</h1>
      </section>
      <section className="card">
        <h2 className="text-lg font-semibold">Create scholarship</h2>
        <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={createScholarship}>
          <label className="text-sm text-muted">
            Title
            <input className="mt-1 w-full rounded-xl border border-border px-3 py-2" value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} />
          </label>
          <label className="text-sm text-muted">
            University
            <select className="mt-1 w-full rounded-xl border border-border px-3 py-2" value={form.universityId} onChange={(event) => setForm((prev) => ({ ...prev, universityId: event.target.value }))}>
              {universities.map((university) => (
                <option key={university.id} value={university.id}>
                  {university.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-muted">
            Discount %
            <input className="mt-1 w-full rounded-xl border border-border px-3 py-2" value={form.discountPercentage} onChange={(event) => setForm((prev) => ({ ...prev, discountPercentage: event.target.value }))} />
          </label>
          <label className="text-sm text-muted">
            Description
            <input className="mt-1 w-full rounded-xl border border-border px-3 py-2" value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} />
          </label>
          <button className="btn-solid md:col-span-2" type="submit">
            Save scholarship
          </button>
        </form>
      </section>
      <section className="card">
        <ul className="space-y-2">
          {scholarships.map((scholarship) => (
            <li key={scholarship.id} className="flex items-center justify-between rounded-xl border border-border px-3 py-2">
              <span>
                {scholarship.title} - {scholarship.university?.name}
              </span>
              <span className="badge">{scholarship.discountPercentage}%</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
