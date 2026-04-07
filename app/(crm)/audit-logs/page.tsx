"use client";

import { useEffect, useState } from "react";

type AuditLog = {
  id: string;
  description: string;
  category?: string | null;
  resourceType?: string | null;
  resourceId?: string | null;
  createdAt: string;
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/audit-logs")
      .then((response) => response.json())
      .then((payload: { logs: AuditLog[] }) => setLogs(payload.logs ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <section className="card">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="icon-svg text-text" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 6h12" />
            <path d="M8 12h12" />
            <path d="M8 18h12" />
            <path d="M3 6h.01M3 12h.01M3 18h.01" />
          </svg>
          <h1 className="text-2xl font-semibold">Audit Logs</h1>
        </div>
        <p className="mt-2 text-sm text-muted">Review all system activity and changes.</p>
      </section>
      <section className="card">
        {loading ? (
          <p className="text-sm text-muted">Loading logs...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-card">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Resource</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>{new Date(log.createdAt).toLocaleString()}</td>
                    <td>{log.category || "-"}</td>
                    <td>{log.description}</td>
                    <td>
                      {log.resourceType || "-"} {log.resourceId ? `#${log.resourceId}` : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
