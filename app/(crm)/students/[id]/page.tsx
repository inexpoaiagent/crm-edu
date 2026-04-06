"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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

type Recommendation = { universityId: string; universityName: string; score: number };

type TimelineResponse = {
  auditLogs: Array<{ id: string; description: string; createdAt: string }>;
  tasks: Array<{ id: string; title: string; updatedAt: string; status: string }>;
  applications: Array<{ id: string; program: string; status: string; updatedAt: string }>;
  documents: Array<{ id: string; type: string; status: string; updatedAt: string }>;
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
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  useEffect(() => {
    async function load() {
      const [studentRes, matchingRes, timelineRes] = await Promise.all([
        fetch(`/api/students/${params.id}`),
        fetch(`/api/matching/student/${params.id}`),
        fetch(`/api/students/${params.id}/timeline`),
      ]);
      const studentPayload = (await studentRes.json()) as { student: StudentDetail };
      const matchingPayload = (await matchingRes.json()) as { recommendations: Recommendation[] };
      const timelinePayload = (await timelineRes.json()) as TimelineResponse;
      setStudent(studentPayload.student);
      setRecommendations(matchingPayload.recommendations ?? []);
      setTimeline(timelinePayload);
    }
    void load();
  }, [params.id]);

  async function deleteStudent() {
    const response = await fetch(`/api/students/${params.id}`, { method: "DELETE" });
    if (response.ok) {
      router.push("/students");
    }
  }

  const targetCountry = useMemo(() => student?.applications[0]?.university?.country ?? "Turkey", [student]);

  if (!student) {
    return <div className="card">Loading student dashboard...</div>;
  }

  const tabCounts: Record<TabKey, number> = {
    overview: 0,
    apps: student.applications.length,
    docs: student.documents.length,
    finance: student.payments.length,
    tasks: student.tasks.length,
    chat: 0,
    "smart-match": recommendations.length,
    timeline: (timeline?.auditLogs.length ?? 0) + (timeline?.applications.length ?? 0),
  };

  return (
    <div className="space-y-6">
      <section className="card flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{student.fullName}</h1>
          <p className="mt-1 text-sm text-muted">
            {student.email} • {student.phone} • {student.nationality}
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
                <p className="text-lg font-semibold">{student.gpa?.toFixed(2) ?? "—"}</p>
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
                <p className="text-lg font-semibold">—</p>
              </div>
            </div>
          </div>
          <div className="card">
            <h2 className="text-lg font-semibold">Quick Actions</h2>
            <div className="mt-4 space-y-3">
              <Link href="/pipeline" className="block rounded-xl border border-border p-3 hover:bg-secondary">
                Move in pipeline board
              </Link>
              <Link href="/student-requests" className="block rounded-xl border border-border p-3 hover:bg-secondary">
                Open student requests
              </Link>
              <Link href="/universities" className="block rounded-xl border border-border p-3 hover:bg-secondary">
                Browse universities
              </Link>
            </div>
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
              <li key={document.id} className="flex items-center justify-between rounded-xl border border-border px-3 py-2">
                <span>{document.type}</span>
                <span className="badge">{document.status}</span>
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
          <p className="mt-2 text-sm text-muted">Messaging module can be connected here.</p>
        </section>
      ) : null}

      {activeTab === "smart-match" ? (
        <section className="card">
          <h2 className="text-lg font-semibold">Smart Match</h2>
          <ul className="mt-4 space-y-2">
            {recommendations.map((recommendation) => (
              <li key={recommendation.universityId} className="flex items-center justify-between rounded-xl border border-border px-3 py-2">
                <span>{recommendation.universityName}</span>
                <span className="badge">{Math.round(recommendation.score * 100)}%</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {activeTab === "timeline" ? (
        <section className="card">
          <h2 className="text-lg font-semibold">Timeline</h2>
          <ul className="mt-4 space-y-2">
            {timeline?.auditLogs.map((item) => (
              <li key={item.id} className="rounded-xl border border-border px-3 py-2">
                <p className="text-sm">{item.description}</p>
                <p className="text-xs text-muted">{new Date(item.createdAt).toLocaleString()}</p>
              </li>
            )) ?? <li className="text-sm text-muted">No timeline entries.</li>}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
