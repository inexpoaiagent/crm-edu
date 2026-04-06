"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type StudentDetail = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  stage: string;
  applications: Array<{ id: string; program: string; status: string }>;
  documents: Array<{ id: string; type: string; status: string }>;
};

type Recommendation = { universityId: string; universityName: string; score: number };

export default function StudentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    async function load() {
      const [studentRes, matchingRes] = await Promise.all([
        fetch(`/api/students/${params.id}`),
        fetch(`/api/matching/student/${params.id}`),
      ]);
      const studentPayload = (await studentRes.json()) as { student: StudentDetail };
      const matchingPayload = (await matchingRes.json()) as { recommendations: Recommendation[] };
      setStudent(studentPayload.student);
      setRecommendations(matchingPayload.recommendations ?? []);
    }
    void load();
  }, [params.id]);

  async function deleteStudent() {
    const response = await fetch(`/api/students/${params.id}`, { method: "DELETE" });
    if (response.ok) {
      router.push("/students");
    }
  }

  if (!student) {
    return <div className="card">Loading student...</div>;
  }

  return (
    <div className="space-y-6">
      <section className="card flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{student.fullName}</h1>
          <p className="mt-1 text-sm text-muted">
            {student.email} | {student.phone}
          </p>
          <span className="badge mt-3">{student.stage}</span>
        </div>
        <button className="btn-ghost text-danger" onClick={deleteStudent} type="button">
          Delete student
        </button>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="text-lg font-semibold">Applications</h2>
          <ul className="mt-4 space-y-2">
            {student.applications.map((application) => (
              <li key={application.id} className="flex items-center justify-between rounded-xl border border-border px-3 py-2">
                <span>{application.program}</span>
                <span className="badge">{application.status}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold">Documents</h2>
          <ul className="mt-4 space-y-2">
            {student.documents.map((document) => (
              <li key={document.id} className="flex items-center justify-between rounded-xl border border-border px-3 py-2">
                <span>{document.type}</span>
                <span className="badge">{document.status}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold">Smart matching recommendations</h2>
        <ul className="mt-4 space-y-2">
          {recommendations.map((recommendation) => (
            <li key={recommendation.universityId} className="flex items-center justify-between rounded-xl border border-border px-3 py-2">
              <span>{recommendation.universityName}</span>
              <span className="badge">{Math.round(recommendation.score * 100)}%</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
