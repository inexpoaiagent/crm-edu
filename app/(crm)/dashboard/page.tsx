"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchJson } from "@/lib/client/fetch-json";

type DashboardResponse = {
  totalStudents: number;
  activeApplications: number;
  pendingTasks: number;
  newRequests: number;
  funnel: Array<{ stage: string; count: number }>;
  recentStudents: Array<{ id: string; fullName: string; nationality: string; stage: string }>;
};

type CopilotBrief = { headline: string; summary: string; recommendations: string[] };
type Prediction = { studentId: string; fullName: string; stage: string; probability: number; reasons: string[]; bestNextAction: string };

const stageLabel: Record<string, string> = {
  LEAD: "Lead",
  APPLIED: "Applied",
  OFFERED: "Accepted",
  ENROLLED: "Enrolled",
};

function temperature(stage: string) {
  if (stage === "ENROLLED" || stage === "OFFERED") return "Hot";
  if (stage === "APPLIED") return "Warm";
  return "Cold";
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [copilot, setCopilot] = useState<CopilotBrief | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [slaStatus, setSlaStatus] = useState<string | null>(null);

  async function load() {
    const [dashboardRes, copilotRes, intelligenceRes] = await Promise.all([
      fetchJson<DashboardResponse>("/api/dashboard/analytics"),
      fetchJson<CopilotBrief>("/api/ai/copilot/dashboard"),
      fetchJson<{ predictions: Prediction[] }>("/api/pipeline/intelligence"),
    ]);

    if (!dashboardRes.response.ok) {
      setError("Failed to load dashboard");
      return;
    }
    setData(dashboardRes.data);
    if (copilotRes.response.ok) setCopilot(copilotRes.data);
    if (intelligenceRes.response.ok) setPredictions(intelligenceRes.data?.predictions ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  const chart = useMemo(() => {
    const normalized = ["LEAD", "APPLIED", "ENROLLED"].map((key) => ({
      label: stageLabel[key],
      count: data?.funnel.find((item) => item.stage === key)?.count ?? 0,
    }));
    const max = Math.max(...normalized.map((item) => item.count), 1);
    return normalized.map((item) => ({ ...item, width: `${(item.count / max) * 100}%` }));
  }, [data]);

  async function runSlaAutomation() {
    setSlaStatus("Running SLA automation...");
    const { response, data } = await fetchJson<{ createdTasks: number; staleApplications: number; unverifiedDocuments: number; overdueTasks: number }>(
      "/api/automation/sla",
      { method: "POST" },
    );
    if (!response.ok || !data) {
      setSlaStatus("SLA run failed.");
      return;
    }
    setSlaStatus(
      `SLA complete: ${data.createdTasks} task(s) created, ${data.staleApplications} stale app(s), ${data.unverifiedDocuments} doc(s), ${data.overdueTasks} overdue task(s).`,
    );
    await load();
  }

  return (
    <div className="space-y-6">
      <section className="card dashboard-hero bg-black text-white">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="dashboard-hero-sub mt-1 text-sm text-white/85">Welcome back, Admin. Here is your operations overview.</p>
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
                  {student.nationality} - {stageLabel[student.stage] ?? student.stage}
                </p>
              </li>
            )) ?? <li className="text-sm text-muted">Loading...</li>}
          </ul>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="card">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">AI Copilot</h2>
            <button className="btn-ghost" type="button" onClick={runSlaAutomation}>
              Run SLA automation
            </button>
          </div>
          <p className="mt-2 text-sm text-muted">{copilot?.summary ?? "Loading copilot brief..."}</p>
          <ul className="mt-4 space-y-2">
            {(copilot?.recommendations ?? []).map((item) => (
              <li key={item} className="rounded-xl border border-border px-3 py-2 text-sm">
                {item}
              </li>
            ))}
          </ul>
          {slaStatus ? <p className="mt-3 text-xs text-success">{slaStatus}</p> : null}
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold">Pipeline Intelligence</h2>
          <ul className="mt-4 space-y-2">
            {predictions.slice(0, 8).map((item) => (
              <li key={item.studentId} className="rounded-xl border border-border px-3 py-2">
                <div className="flex items-center justify-between">
                  <Link href={`/students/${item.studentId}`} className="font-semibold hover:underline">
                    {item.fullName}
                  </Link>
                  <span className="badge">{item.probability}%</span>
                </div>
                <p className="mt-1 text-xs text-muted">{item.reasons.join(", ")}</p>
                <p className="mt-1 text-xs text-text">Next: {item.bestNextAction}</p>
              </li>
            ))}
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
