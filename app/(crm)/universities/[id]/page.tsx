"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchJson } from "@/lib/client/fetch-json";

type University = {
  id: string;
  name: string;
  country: string;
  website?: string;
  tuitionRange?: string;
  language: string;
  programs: string[];
  deadline?: string;
  description?: string;
  programDetails?: Array<{
    id: string;
    level: string;
    programName: string;
    language?: string | null;
    durationYears?: number | null;
    currency: string;
    baseFee?: number | null;
    installmentDiscountPct?: number | null;
    installmentFee?: number | null;
    fullPaymentDiscountPct?: number | null;
    fullPaymentFee?: number | null;
    scholarshipPct?: number | null;
    scholarshipFee?: number | null;
    prepaymentFee?: number | null;
    notes?: string | null;
  }>;
};

export default function UniversityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [university, setUniversity] = useState<University | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    country: "Turkey",
    website: "",
    tuitionRange: "",
    language: "",
    programs: "",
    deadline: "",
    description: "",
  });

  useEffect(() => {
    if (!id) return;
    void (async () => {
      const { response, data } = await fetchJson<{ university?: University; error?: string }>(`/api/universities/${id}`);
      if (!response.ok) {
        setError(data?.error || "Failed to load university.");
        return;
      }
      if (!data?.university) {
        setError("University not found.");
        return;
      }
      setUniversity(data.university);
      setForm({
        name: data.university.name ?? "",
        country: data.university.country ?? "Turkey",
        website: data.university.website ?? "",
        tuitionRange: data.university.tuitionRange ?? "",
        language: data.university.language ?? "",
        programs: (data.university.programs ?? []).join(", "),
        deadline: data.university.deadline ? String(data.university.deadline).slice(0, 10) : "",
        description: (data.university as { description?: string }).description ?? "",
      });
    })();
  }, [id]);

  async function saveUniversity() {
    const response = await fetch(`/api/universities/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        country: form.country,
        website: form.website || undefined,
        tuitionRange: form.tuitionRange,
        language: form.language,
        programs: Array.from(new Set(form.programs.split(",").map((item) => item.trim()).filter(Boolean))),
        deadline: form.deadline || null,
        description: form.description,
      }),
    });
    if (!response.ok) return;
    const { data } = await fetchJson<{ university?: University }>(`/api/universities/${id}`);
    if (data?.university) setUniversity(data.university);
  }

  async function deleteUniversity() {
    const response = await fetch(`/api/universities/${id}`, { method: "DELETE" });
    if (response.ok) router.push("/universities");
  }

  if (error) return <div className="card text-danger">{error}</div>;
  if (!university) return <div className="card">Loading university...</div>;

  return (
    <div className="card space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{university.name}</h1>
          <p className="text-sm text-muted">{university.country}</p>
        </div>
        <button className="btn-ghost text-danger" type="button" onClick={deleteUniversity}>
          Delete university
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm text-muted">
          Name
          <input className="mt-1 w-full rounded-xl border border-border px-3 py-2" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
        </label>
        <label className="text-sm text-muted">
          Country
          <select className="mt-1 w-full rounded-xl border border-border px-3 py-2" value={form.country} onChange={(event) => setForm((prev) => ({ ...prev, country: event.target.value }))}>
            <option value="Turkey">Turkey</option>
            <option value="Northern Cyprus">Northern Cyprus</option>
          </select>
        </label>
        <label className="text-sm text-muted">
          Website
          <input className="mt-1 w-full rounded-xl border border-border px-3 py-2" value={form.website} onChange={(event) => setForm((prev) => ({ ...prev, website: event.target.value }))} />
        </label>
        <label className="text-sm text-muted">
          Tuition
          <input className="mt-1 w-full rounded-xl border border-border px-3 py-2" value={form.tuitionRange} onChange={(event) => setForm((prev) => ({ ...prev, tuitionRange: event.target.value }))} />
        </label>
        <label className="text-sm text-muted">
          Language
          <input className="mt-1 w-full rounded-xl border border-border px-3 py-2" value={form.language} onChange={(event) => setForm((prev) => ({ ...prev, language: event.target.value }))} />
        </label>
        <label className="text-sm text-muted">
          Deadline
          <input type="date" className="mt-1 w-full rounded-xl border border-border px-3 py-2" value={form.deadline} onChange={(event) => setForm((prev) => ({ ...prev, deadline: event.target.value }))} />
        </label>
        <label className="text-sm text-muted md:col-span-2">
          Programs
          <input className="mt-1 w-full rounded-xl border border-border px-3 py-2" value={form.programs} onChange={(event) => setForm((prev) => ({ ...prev, programs: event.target.value }))} />
        </label>
        <label className="text-sm text-muted md:col-span-2">
          Description
          <textarea className="mt-1 w-full rounded-xl border border-border px-3 py-2" value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} />
        </label>
      </div>
      <div>
        <button className="btn-solid" type="button" onClick={saveUniversity}>
          Save changes
        </button>
      </div>
      {university.programDetails?.length ? (
        <div className="mt-4 overflow-x-auto">
          <h2 className="mb-2 text-lg font-semibold">Program Fee Catalog</h2>
          <table className="table-card">
            <thead>
              <tr>
                <th>Level</th>
                <th>Program</th>
                <th>Lang</th>
                <th>Duration</th>
                <th>Base</th>
                <th>Installment</th>
                <th>Full Payment</th>
                <th>Scholarship</th>
              </tr>
            </thead>
            <tbody>
              {university.programDetails.map((item) => (
                <tr key={item.id}>
                  <td>{item.level}</td>
                  <td>{item.programName}</td>
                  <td>{item.language ?? "-"}</td>
                  <td>{item.durationYears ?? "-"}</td>
                  <td>{item.baseFee ? `${item.currency} ${item.baseFee}` : "-"}</td>
                  <td>{item.installmentFee ? `${item.currency} ${item.installmentFee}` : "-"}</td>
                  <td>{item.fullPaymentFee ? `${item.currency} ${item.fullPaymentFee}` : "-"}</td>
                  <td>{item.scholarshipFee ? `${item.currency} ${item.scholarshipFee}` : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
