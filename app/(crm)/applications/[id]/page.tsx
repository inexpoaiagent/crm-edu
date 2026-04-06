"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Application = {
  id: string;
  program: string;
  intake: string;
  status: string;
  notes?: string;
  student: { fullName: string };
  university: { name: string };
};

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [application, setApplication] = useState<Application | null>(null);

  useEffect(() => {
    fetch(`/api/applications/${id}`)
      .then((response) => response.json())
      .then((payload: { application: Application }) => setApplication(payload.application));
  }, [id]);

  if (!application) return <div className="card">Loading application...</div>;

  return (
    <div className="card space-y-3">
      <h1 className="text-2xl font-semibold">{application.program}</h1>
      <p className="text-sm text-muted">Student: {application.student?.fullName}</p>
      <p className="text-sm text-muted">University: {application.university?.name}</p>
      <p className="text-sm text-muted">Intake: {application.intake}</p>
      <span className="badge">{application.status}</span>
      {application.notes ? <p className="rounded-xl bg-secondary p-3 text-sm">{application.notes}</p> : null}
    </div>
  );
}
