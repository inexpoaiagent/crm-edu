"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchJson } from "@/lib/client/fetch-json";

type StudentDetail = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  nationality: string;
  stage: string;
  gpa?: number | null;
  englishLevel: string;
  fieldOfStudy: string;
  budget?: number | null;
  applications: Array<{ id: string; program: string; status: string; university?: { country?: string | null } | null }>;
  documents: Array<{ id: string; type: string; status: string; fileName?: string }>;
  payments: Array<{ id: string; type: string; amount: number; currency: string }>;
  tasks: Array<{ id: string; title: string; status: string; deadline?: string | null }>;
};

type Recommendation = { universityId: string; universityName: string; score: number; factors?: string[]; recommendedProgram?: string };
type TimelineEvent = { id: string; type: string; title: string; at: string; meta?: Record<string, string> };

type TimelineResponse = {
  events: TimelineEvent[];
};

type CopilotResponse = {
  summary: string;
  nextActions: string[];
  draftMessages: { toStudent: string; toUniversity: string };
  riskAlerts: string[];
};

type TabKey = "overview" | "apps" | "docs" | "finance" | "tasks" | "chat" | "smart-match" | "timeline";

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "overview", label: "Overview" },
  { key: "apps", label: "Apps" },
  { key: "docs", label: "Docs" },
  { key: "finance", label: "Finance" },
  { key: "tasks", label: "Tasks" },
  { key: "chat", label: "Chat" },
  { key: "smart-match", label: "Smart Match" },
  { key: "timeline", label: "Timeline" },
];

export default function StudentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [timeline, setTimeline] = useState<TimelineResponse | null>(null);
  const [copilot, setCopilot] = useState<CopilotResponse | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [docInsights, setDocInsights] = useState<Record<string, string>>({});

  useEffect(() => {
    async function load() {
      const [studentRes, matchingRes, timelineRes, copilotRes] = await Promise.all([
        fetchJson<{ student: StudentDetail }>(`/api/students/${params.id}`),
        fetchJson<{ recommendations: Recommendation[] }>(`/api/matching/student/${params.id}`),
        fetchJson<TimelineResponse>(`/api/students/${params.id}/timeline`),
        fetchJson<CopilotResponse>(`/api/ai/copilot/student/${params.id}`),
      ]);
      if (!studentRes.response.ok) return;
      setStudent(studentRes.data?.student ?? null);
      if (matchingRes.response.ok) setRecommendations(matchingRes.data?.recommendations ?? []);
      if (timelineRes.response.ok) setTimeline(timelineRes.data ?? null);
      if (copilotRes.response.ok) setCopilot(copilotRes.data ?? null);
    }
    void load();
  }, [params.id]);

  async function deleteStudent() {
    const response = await fetch(`/api/students/${params.id}`, { method: "DELETE" });
    if (response.ok) router.push("/students");
  }

  const targetCountry = useMemo(() => student?.applications[0]?.university?.country ?? "Turkey", [student]);

  if (!student) return <div className="card">Loading student dashboard...</div>;

  const tabCounts: Record<TabKey, number> = {
    overview: 0,
    apps: student.applications.length,
    docs: student.documents.length,
    finance: student.payments.length,
    tasks: student.tasks.length,
    chat: 0,
    "smart-match": recommendations.length,
    timeline: timeline?.events.length ?? 0,
  };

  return (
    <div className="space-y-6">
      <section className="card flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{student.fullName}</h1>
          <p className="mt-1 text-sm text-muted">
            {student.email} - {student.phone} - {student.nationality}
          </p>
          <span className="badge mt-3">{student.stage}</span>
        </div>
        <button className="btn-ghost text-danger" onClick={deleteStudent} type="button">
          Delete student
        </button>
      </section>

      <section className="card">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`rounded-xl border px-3 py-2 text-sm ${activeTab === tab.key ? "border-primary bg-secondary text-text" : "border-border text-muted"}`}
              onClick={() => setActiveTab(tab.key)}
              type="button"
            >
              {tab.label}
              {tab.key !== "overview" ? ` (${tabCounts[tab.key]})` : ""}
            </button>
          ))}
        </div>
      </section>

      {activeTab === "overview" ? (
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="card">
            <h2 className="text-lg font-semibold">Academic Profile</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-border p-3">
                <p className="text-muted">GPA</p>
                <p className="text-lg font-semibold">{student.gpa?.toFixed(2) ?? "-"}</p>
              </div>
              <div className="rounded-xl border border-border p-3">
                <p className="text-muted">English Level</p>
                <p className="text-lg font-semibold">{student.englishLevel || "IELTS"}</p>
              </div>
              <div className="rounded-xl border border-border p-3">
                <p className="text-muted">Field of Study</p>
                <p className="text-lg font-semibold">{student.fieldOfStudy}</p>
              </div>
              <div className="rounded-xl border border-border p-3">
                <p className="text-muted">Target Country</p>
                <p className="text-lg font-semibold">{targetCountry}</p>
              </div>
              <div className="rounded-xl border border-border p-3">
                <p className="text-muted">Budget (USD)</p>
                <p className="text-lg font-semibold">{student.budget ? `$${student.budget.toLocaleString()}` : "$8,000"}</p>
              </div>
              <div className="rounded-xl border border-border p-3">
                <p className="text-muted">Passport #</p>
                <p className="text-lg font-semibold">-</p>
              </div>
            </div>
          </div>
          <div className="card">
            <h2 className="text-lg font-semibold">AI Copilot</h2>
            <p className="mt-2 text-sm text-muted">{copilot?.summary ?? "Loading copilot..."}</p>
            <ul className="mt-3 space-y-1 text-sm">
              {(copilot?.nextActions ?? []).map((action) => (
                <li key={action}>- {action}</li>
              ))}
            </ul>
            {copilot?.riskAlerts?.length ? (
              <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                {copilot.riskAlerts.join(" | ")}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {activeTab === "apps" ? (
        <section className="card">
          <h2 className="text-lg font-semibold">Applications ({student.applications.length})</h2>
          <ul className="mt-4 space-y-2">
            {student.applications.map((application) => (
              <li key={application.id} className="flex items-center justify-between rounded-xl border border-border px-3 py-2">
                <span>{application.program}</span>
                <span className="badge">{application.status}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {activeTab === "docs" ? (
        <section className="card">
          <h2 className="text-lg font-semibold">Documents ({student.documents.length})</h2>
          <ul className="mt-4 space-y-2">
            {student.documents.map((document) => (
              <li key={document.id} className="rounded-xl border border-border px-3 py-2">
                <div className="flex items-center justify-between">
                  <span>{document.type}</span>
                  <div className="flex items-center gap-2">
                    <button
                      className="rounded-md border border-border px-2 py-1 text-xs text-muted hover:bg-secondary"
                      type="button"
                      onClick={async () => {
                        const result = await fetchJson<{ recommendations: string[] }>(`/api/documents/${document.id}/analyze`, { method: "POST" });
                        if (!result.response.ok) return;
                        setDocInsights((prev) => ({ ...prev, [document.id]: (result.data?.recommendations ?? []).join(" | ") }));
                      }}
                    >
                      Analyze
                    </button>
                    <span className="badge">{document.status}</span>
                  </div>
                </div>
                {docInsights[document.id] ? <p className="mt-2 text-xs text-muted">{docInsights[document.id]}</p> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {activeTab === "finance" ? (
        <section className="card">
          <h2 className="text-lg font-semibold">Finance ({student.payments.length})</h2>
          <ul className="mt-4 space-y-2">
            {student.payments.map((payment) => (
              <li key={payment.id} className="flex items-center justify-between rounded-xl border border-border px-3 py-2">
                <span>{payment.type}</span>
                <span className="font-semibold">
                  {payment.amount} {payment.currency}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {activeTab === "tasks" ? (
        <section className="card">
          <h2 className="text-lg font-semibold">Tasks ({student.tasks.length})</h2>
          <ul className="mt-4 space-y-2">
            {student.tasks.map((task) => (
              <li key={task.id} className="flex items-center justify-between rounded-xl border border-border px-3 py-2">
                <span>{task.title}</span>
                <span className="badge">{task.status}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {activeTab === "chat" ? (
        <section className="card">
          <h2 className="text-lg font-semibold">Chat (0)</h2>
          <p className="mt-2 text-sm text-muted">Communication Hub wiring can connect here.</p>
          {copilot ? (
            <div className="mt-4 grid gap-3">
              <div className="rounded-xl border border-border p-3 text-sm">
                <p className="mb-1 font-semibold">Draft to Student</p>
                <p>{copilot.draftMessages.toStudent}</p>
              </div>
              <div className="rounded-xl border border-border p-3 text-sm">
                <p className="mb-1 font-semibold">Draft to University</p>
                <p>{copilot.draftMessages.toUniversity}</p>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {activeTab === "smart-match" ? (
        <section className="card">
          <h2 className="text-lg font-semibold">Smart Match</h2>
          <ul className="mt-4 space-y-2">
            {recommendations.map((recommendation) => (
              <li key={recommendation.universityId} className="flex items-center justify-between rounded-xl border border-border px-3 py-2">
                <div>
                  <p className="font-medium">{recommendation.universityName}</p>
                  <p className="text-xs text-muted">
                    Program: {recommendation.recommendedProgram || "General"} - {(recommendation.factors || []).join(", ") || "best fit"}
                  </p>
                </div>
                <span className="badge">{Math.round(recommendation.score * 100)}%</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {activeTab === "timeline" ? (
        <section className="card">
          <h2 className="text-lg font-semibold">Timeline 360</h2>
          <ul className="mt-4 space-y-2">
            {timeline?.events.map((event) => (
              <li key={event.id} className="rounded-xl border border-border px-3 py-2">
                <p className="text-xs uppercase text-muted">{event.type}</p>
                <p className="text-sm">{event.title}</p>
                <p className="text-xs text-muted">{new Date(event.at).toLocaleString()}</p>
              </li>
            )) ?? <li className="text-sm text-muted">No timeline entries.</li>}
          </ul>
        </section>
      ) : null}

      <section className="card">
        <h2 className="text-lg font-semibold">Quick Actions</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Link href="/pipeline" className="rounded-xl border border-border p-3 hover:bg-secondary">
            Open Trello+ board
          </Link>
          <Link href="/student-requests" className="rounded-xl border border-border p-3 hover:bg-secondary">
            Manage requests
          </Link>
          <Link href="/universities" className="rounded-xl border border-border p-3 hover:bg-secondary">
            Browse universities
          </Link>
        </div>
      </section>
    </div>
  );
}
