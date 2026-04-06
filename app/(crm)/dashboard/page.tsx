"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type DashboardResponse = {
  totalStudents: number;
  activeApplications: number;
  pendingTasks: number;
  newRequests: number;
  funnel: Array<{ stage: string; count: number }>;
  recentStudents: Array<{ id: string; fullName: string; nationality: string; stage: string }>;
};

const stageLabel: Record<string, string> = {
  LEAD: "Lead",
  APPLIED: "Applied",
  OFFERED: "Accepted",
  ENROLLED: "Enrolled",
};

function temperature(stage: string) {
  if (stage === "ENROLLED" || stage === "OFFERED") return "🔥 Hot";
  if (stage === "APPLIED") return "🌤 Warm";
  return "❄️ Cold";
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/analytics")
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed to load dashboard");
        return (await response.json()) as DashboardResponse;
      })
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  const chart = useMemo(() => {
    const normalized = ["LEAD", "APPLIED", "ENROLLED"].map((key) => ({
      label: stageLabel[key],
      count: data?.funnel.find((item) => item.stage === key)?.count ?? 0,
    }));
    const max = Math.max(...normalized.map((item) => item.count), 1);
    return normalized.map((item) => ({ ...item, width: `${(item.count / max) * 100}%` }));
  }, [data]);

  return (
    <div className="space-y-6">
      <section className="card bg-gradient-to-r from-[#0f62fe] to-[#2d8bff] text-white">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm text-white/85">Welcome back, Admin! Here&apos;s your overview.</p>
      </section>

      {error ? <section className="card text-danger">{error}</section> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="card">
          <p className="text-sm text-muted">Total Students</p>
          <p className="mt-2 text-4xl font-semibold">{data?.totalStudents ?? 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-muted">Active Applications</p>
          <p className="mt-2 text-4xl font-semibold">{data?.activeApplications ?? 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-muted">Pending Tasks</p>
          <p className="mt-2 text-4xl font-semibold">{data?.pendingTasks ?? 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-muted">New Requests</p>
          <p className="mt-2 text-4xl font-semibold">{data?.newRequests ?? 0}</p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="card xl:col-span-2">
          <h2 className="text-xl font-semibold">Pipeline Overview</h2>
          <div className="mt-4 space-y-3">
            {chart.map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span>{item.label}</span>
                  <span>{item.count}</span>
                </div>
                <div className="h-2 rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-primary" style={{ width: item.width }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Students</h2>
            <Link className="text-sm text-primary underline" href="/students">
              View all
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {data?.recentStudents.map((student) => (
              <li key={student.id} className="rounded-2xl border border-border p-3">
                <div className="flex items-center justify-between">
                  <Link href={`/students/${student.id}`} className="font-semibold text-text hover:underline">
                    {student.fullName}
                  </Link>
                  <span className="text-xs text-muted">{temperature(student.stage)}</span>
                </div>
                <p className="mt-1 text-xs text-muted">
                  {student.nationality} • {stageLabel[student.stage] ?? student.stage}
                </p>
              </li>
            )) ?? <li className="text-sm text-muted">Loading...</li>}
          </ul>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Link href="/student-requests" className="card transition hover:-translate-y-0.5 hover:shadow-2xl">
          <h3 className="text-lg font-semibold">Manage Student Requests</h3>
          <p className="mt-2 text-sm text-muted">Approve or reject new student portal requests.</p>
        </Link>
        <Link href="/pipeline" className="card transition hover:-translate-y-0.5 hover:shadow-2xl">
          <h3 className="text-lg font-semibold">View Kanban Board</h3>
          <p className="mt-2 text-sm text-muted">Drag and drop students through the pipeline.</p>
        </Link>
        <Link href="/audit-logs" className="card transition hover:-translate-y-0.5 hover:shadow-2xl">
          <h3 className="text-lg font-semibold">Audit Logs</h3>
          <p className="mt-2 text-sm text-muted">Review all system activity and changes.</p>
        </Link>
      </section>
    </div>
  );
}
