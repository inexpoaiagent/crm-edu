"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type StudentMe = {
  id: string;
  fullName: string;
  stage: string;
};

export default function PortalDashboardPage() {
  const [student, setStudent] = useState<StudentMe | null>(null);
  const [applications, setApplications] = useState<Array<{ id: string; status: string }>>([]);
  const [documents, setDocuments] = useState<Array<{ id: string; status: string }>>([]);

  useEffect(() => {
    async function load() {
      const [meRes, appRes, docRes] = await Promise.all([
        fetch("/api/portal/auth/me"),
        fetch("/api/portal/applications"),
        fetch("/api/portal/documents"),
      ]);
      const mePayload = (await meRes.json()) as { student: StudentMe };
      const appPayload = (await appRes.json()) as { applications: Array<{ id: string; status: string }> };
      const docPayload = (await docRes.json()) as { documents: Array<{ id: string; status: string }> };
      setStudent(mePayload.student);
      setApplications(appPayload.applications ?? []);
      setDocuments(docPayload.documents ?? []);
    }
    void load();
  }, []);

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
