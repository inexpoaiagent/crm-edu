"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type University = {
  id: string;
  name: string;
  country: string;
  language: string;
  tuitionRange?: string;
};

export default function UniversitiesPage() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [form, setForm] = useState({
    name: "",
    country: "Turkey",
    website: "",
    tuitionRange: "",
    language: "English",
    programs: "Computer Science",
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
        programs: "Computer Science",
      });
      await load();
    }
  }

  return (
    <div className="space-y-6">
      <section className="card">
        <h1 className="text-2xl font-semibold">Universities</h1>
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
      <section className="card">
        <div className="overflow-x-auto">
          <table className="table-card">
            <thead>
              <tr>
                <th>Name</th>
                <th>Country</th>
                <th>Language</th>
                <th>Tuition</th>
              </tr>
            </thead>
            <tbody>
              {universities.map((university) => (
                <tr key={university.id}>
                  <td>
                    <Link href={`/universities/${university.id}`} className="text-primary underline">
                      {university.name}
                    </Link>
                  </td>
                  <td>{university.country}</td>
                  <td>{university.language}</td>
                  <td>{university.tuitionRange}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
