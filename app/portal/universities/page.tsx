"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchJson } from "@/lib/client/fetch-json";

type University = {
  id: string;
  name: string;
  country: string;
  language: string;
  tuitionRange?: string;
};

export default function PortalUniversitiesPage() {
  const router = useRouter();
  const [universities, setUniversities] = useState<University[]>([]);
  const [applyForm, setApplyForm] = useState({ universityId: "", program: "", intake: "" });
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const { response, data } = await fetchJson<{ universities: University[] }>("/api/portal/universities");
    if (response.status === 401) {
      router.push("/portal/login");
      return;
    }
    if (!response.ok) {
      setError("Unable to load universities.");
      return;
    }
    setUniversities(data?.universities ?? []);
    if (!applyForm.universityId && data?.universities?.length) {
      setApplyForm((prev) => ({ ...prev, universityId: data.universities[0].id }));
    }
  }

  useEffect(() => {
    void load();
  }, [router]);

  async function apply(event: React.FormEvent) {
    event.preventDefault();
    await fetch("/api/portal/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(applyForm),
    });
    setApplyForm((prev) => ({ ...prev, program: "", intake: "" }));
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-semibold text-white">Universities</h1>
      </section>
      {error ? <section className="rounded-2xl border border-red-300 bg-red-500/10 p-4 text-sm text-red-100">{error}</section> : null}
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-semibold text-white">Apply to a university</h2>
        <form className="mt-4 grid gap-3 md:grid-cols-3" onSubmit={apply}>
          <label className="text-sm text-white/70">
            University
            <select className="mt-1 w-full rounded-xl border border-white/20 bg-transparent px-3 py-2 text-white" value={applyForm.universityId} onChange={(event) => setApplyForm((prev) => ({ ...prev, universityId: event.target.value }))}>
              {universities.map((university) => (
                <option key={university.id} value={university.id} className="text-black">
                  {university.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-white/70">
            Program
            <input className="mt-1 w-full rounded-xl border border-white/20 bg-transparent px-3 py-2 text-white" value={applyForm.program} onChange={(event) => setApplyForm((prev) => ({ ...prev, program: event.target.value }))} />
          </label>
          <label className="text-sm text-white/70">
            Intake
            <input className="mt-1 w-full rounded-xl border border-white/20 bg-transparent px-3 py-2 text-white" value={applyForm.intake} onChange={(event) => setApplyForm((prev) => ({ ...prev, intake: event.target.value }))} />
          </label>
          <button className="btn-solid md:col-span-3" type="submit">
            Submit application
          </button>
        </form>
      </section>
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <ul className="space-y-2">
          {universities.map((university) => (
            <li key={university.id} className="rounded-xl border border-white/10 p-3 text-white">
              <div className="font-semibold">{university.name}</div>
              <div className="text-xs text-white/60">
                {university.country} | {university.language} | {university.tuitionRange}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
