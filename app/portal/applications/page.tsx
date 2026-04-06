"use client";

import { useEffect, useState } from "react";

type Application = {
  id: string;
  program: string;
  intake: string;
  status: string;
  university: { name: string };
};

export default function PortalApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    fetch("/api/portal/applications")
      .then((response) => response.json())
      .then((payload: { applications: Application[] }) => setApplications(payload.applications ?? []));
  }, []);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-semibold text-white">My applications</h1>
      </section>
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <ul className="space-y-3">
          {applications.map((application) => (
            <li key={application.id} className="flex items-center justify-between rounded-xl border border-white/10 p-3 text-white">
              <div>
                <div className="font-semibold">
                  {application.program} - {application.university?.name}
                </div>
                <div className="text-xs text-white/60">Intake: {application.intake}</div>
              </div>
              <span className="rounded-full border border-white/30 px-3 py-1 text-xs">{application.status}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
