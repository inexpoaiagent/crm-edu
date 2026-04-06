"use client";

import { useEffect, useMemo, useState } from "react";

type StudentRequest = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  intake?: string | null;
  notes?: string | null;
  status: string;
  createdAt: string;
};

export default function StudentRequestsPage() {
  const [requests, setRequests] = useState<StudentRequest[]>([]);
  const [activeTab, setActiveTab] = useState<"PENDING" | "PROCESSED">("PENDING");
  const [isSaving, setIsSaving] = useState<string | null>(null);

  async function load() {
    const response = await fetch("/api/student-requests");
    const payload = (await response.json()) as { requests: StudentRequest[] };
    setRequests(payload.requests ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  const pending = useMemo(() => requests.filter((item) => item.status === "PENDING"), [requests]);
  const processed = useMemo(() => requests.filter((item) => item.status !== "PENDING"), [requests]);
  const rows = activeTab === "PENDING" ? pending : processed;

  async function approve(requestId: string) {
    const username = window.prompt("Student username:", `student_${requestId.slice(0, 6)}`);
    if (!username) return;
    const password = window.prompt("Student password:", "Test12345!");
    if (!password) return;

    setIsSaving(requestId);
    await fetch("/api/student-requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, action: "APPROVE", username, password }),
    });
    setIsSaving(null);
    await load();
  }

  async function reject(requestId: string) {
    const message = window.prompt("Rejection message (optional):", "");
    setIsSaving(requestId);
    await fetch("/api/student-requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, action: "REJECT", message }),
    });
    setIsSaving(null);
    await load();
  }

  return (
    <div className="space-y-6">
      <section className="card">
        <h1 className="text-2xl font-semibold">Student Requests</h1>
        <p className="mt-2 text-sm text-muted">Incoming applications from the student portal.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className={`btn-ghost ${activeTab === "PENDING" ? "bg-secondary" : ""}`} onClick={() => setActiveTab("PENDING")} type="button">
            Pending ({pending.length})
          </button>
          <button className={`btn-ghost ${activeTab === "PROCESSED" ? "bg-secondary" : ""}`} onClick={() => setActiveTab("PROCESSED")} type="button">
            Processed ({processed.length})
          </button>
        </div>
      </section>

      <section className="card">
        <ul className="space-y-3">
          {rows.map((request) => (
            <li key={request.id} className="rounded-2xl border border-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{request.fullName}</h2>
                  <p className="text-sm text-muted">
                    {request.email} • {request.phone}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Intake: {request.intake || "—"} • {new Date(request.createdAt).toLocaleString()}
                  </p>
                  {request.notes ? <p className="mt-2 text-sm text-text">{request.notes}</p> : null}
                </div>

                {request.status === "PENDING" ? (
                  <div className="flex flex-wrap gap-2">
                    <button className="btn-solid" disabled={isSaving === request.id} onClick={() => approve(request.id)} type="button">
                      Approve
                    </button>
                    <button className="btn-ghost" disabled={isSaving === request.id} onClick={() => alert(`More info\n\nName: ${request.fullName}\nEmail: ${request.email}\nPhone: ${request.phone}\nNotes: ${request.notes || "-"}`)} type="button">
                      More info
                    </button>
                    <button className="btn-ghost text-danger" disabled={isSaving === request.id} onClick={() => reject(request.id)} type="button">
                      Reject
                    </button>
                  </div>
                ) : (
                  <span className="badge">{request.status}</span>
                )}
              </div>
            </li>
          ))}
          {!rows.length ? <li className="text-sm text-muted">No requests in this tab.</li> : null}
        </ul>
      </section>
    </div>
  );
}
