"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchJson } from "@/lib/client/fetch-json";

type StudentMe = {
  id: string;
  fullName: string;
  stage: string;
};

export default function PortalDashboardPage() {
  const router = useRouter();
  const [student, setStudent] = useState<StudentMe | null>(null);
  const [applications, setApplications] = useState<Array<{ id: string; status: string }>>([]);
  const [documents, setDocuments] = useState<Array<{ id: string; status: string }>>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [meRes, appRes, docRes] = await Promise.all([
        fetchJson<{ student: StudentMe }>("/api/portal/auth/me"),
        fetchJson<{ applications: Array<{ id: string; status: string }> }>("/api/portal/applications"),
        fetchJson<{ documents: Array<{ id: string; status: string }> }>("/api/portal/documents"),
      ]);
      if ([meRes, appRes, docRes].some((item) => item.response.status === 401)) {
        router.push("/portal/login");
        return;
      }
      if (!meRes.response.ok || !appRes.response.ok || !docRes.response.ok) {
        setError("Unable to load portal data right now.");
        return;
      }
      setStudent(meRes.data?.student ?? null);
      setApplications(appRes.data?.applications ?? []);
      setDocuments(docRes.data?.documents ?? []);
    }
    void load();
  }, [router]);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl">
        <p className="text-sm uppercase tracking-[0.5em] text-white/60">Welcome back</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">{student?.fullName ?? "Student"}</h1>
        <p className="mt-2 text-sm text-white/70">Stage: {student?.stage ?? "-"}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="text-xs uppercase tracking-[0.3em] text-white/40">Applications</div>
            <div className="text-2xl font-semibold text-white">{applications.length}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="text-xs uppercase tracking-[0.3em] text-white/40">Documents</div>
            <div className="text-2xl font-semibold text-white">{documents.length}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="text-xs uppercase tracking-[0.3em] text-white/40">Verified docs</div>
            <div className="text-2xl font-semibold text-white">{documents.filter((doc) => doc.status === "VERIFIED").length}</div>
          </div>
        </div>
      </section>
      {error ? <section className="rounded-2xl border border-red-300 bg-red-500/10 p-4 text-sm text-red-100">{error}</section> : null}
      <section className="grid gap-4 md:grid-cols-3">
        <Link href="/portal/universities" className="rounded-2xl border border-white/20 p-4 text-white hover:bg-white/5">
          Browse universities
        </Link>
        <Link href="/portal/applications" className="rounded-2xl border border-white/20 p-4 text-white hover:bg-white/5">
          My applications
        </Link>
        <Link href="/portal/documents" className="rounded-2xl border border-white/20 p-4 text-white hover:bg-white/5">
          Upload documents
        </Link>
      </section>
    </div>
  );
}
