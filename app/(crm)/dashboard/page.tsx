"use client";

import { useEffect, useState } from "react";

type AnalyticsResponse = {
  funnel: Array<{ stage: string; count: number }>;
  applicationStatus: Array<{ status: string; count: number }>;
  revenue: number;
  topAgents: Array<{ agentId: string | null; studentCount: number; name: string }>;
};

export default function DashboardPage() {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/analytics")
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed to load analytics");
        return (await response.json()) as AnalyticsResponse;
      })
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="space-y-6">
      <section className="card">
        <h1 className="text-2xl font-semibold text-text">Dashboard & analytics</h1>
        <p className="mt-2 text-sm text-muted">Funnel, revenue, and top agent insights per tenant.</p>
      </section>

      {error ? <section className="card text-danger">{error}</section> : null}

      <section className="grid gap-6 md:grid-cols-3">
        <div className="card">
          <p className="text-sm text-muted">Revenue</p>
          <p className="mt-3 text-3xl font-semibold">{data ? `TRY ${data.revenue.toLocaleString()}` : "-"}</p>
        </div>
        <div className="card">
          <p className="text-sm text-muted">Funnel stages</p>
          <p className="mt-3 text-3xl font-semibold">{data?.funnel.length ?? 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-muted">Top agents</p>
          <p className="mt-3 text-3xl font-semibold">{data?.topAgents.length ?? 0}</p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="text-lg font-semibold">Lead to enrolled funnel</h2>
          <ul className="mt-4 space-y-2">
            {data?.funnel.map((item) => (
              <li key={item.stage} className="flex items-center justify-between rounded-xl border border-border px-3 py-2">
                <span>{item.stage}</span>
                <span className="badge">{item.count}</span>
              </li>
            )) ?? <li className="text-sm text-muted">Loading...</li>}
          </ul>
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold">Top agents</h2>
          <ul className="mt-4 space-y-2">
            {data?.topAgents.map((item) => (
              <li key={`${item.agentId}-${item.name}`} className="flex items-center justify-between rounded-xl border border-border px-3 py-2">
                <span>{item.name}</span>
                <span className="badge">{item.studentCount} students</span>
              </li>
            )) ?? <li className="text-sm text-muted">Loading...</li>}
          </ul>
        </div>
      </section>
    </div>
  );
}
