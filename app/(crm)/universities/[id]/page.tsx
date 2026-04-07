"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchJson } from "@/lib/client/fetch-json";

type University = {
  id: string;
  name: string;
  country: string;
  website?: string;
  tuitionRange?: string;
  language: string;
  programs: string[];
  deadline?: string;
  programDetails?: Array<{
    id: string;
    level: string;
    programName: string;
    language?: string | null;
    durationYears?: number | null;
    currency: string;
    baseFee?: number | null;
    installmentDiscountPct?: number | null;
    installmentFee?: number | null;
    fullPaymentDiscountPct?: number | null;
    fullPaymentFee?: number | null;
    scholarshipPct?: number | null;
    scholarshipFee?: number | null;
    prepaymentFee?: number | null;
    notes?: string | null;
  }>;
};

export default function UniversityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [university, setUniversity] = useState<University | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    void (async () => {
      const { response, data } = await fetchJson<{ university?: University; error?: string }>(`/api/universities/${id}`);
      if (!response.ok) {
        setError(data?.error || "Failed to load university.");
        return;
      }
      if (!data?.university) {
        setError("University not found.");
        return;
      }
      setUniversity(data.university);
    })();
  }, [id]);

  if (error) return <div className="card text-danger">{error}</div>;
  if (!university) return <div className="card">Loading university...</div>;

  return (
    <div className="card space-y-3">
      <h1 className="text-2xl font-semibold">{university.name}</h1>
      <p className="text-sm text-muted">{university.country}</p>
      <p className="text-sm text-muted">Language: {university.language}</p>
      <p className="text-sm text-muted">Tuition: {university.tuitionRange ?? "-"}</p>
      <p className="text-sm text-muted">Programs: {university.programs.join(", ")}</p>
      {university.website ? (
        <a href={university.website} className="text-primary underline" target="_blank" rel="noreferrer">
          Open website
        </a>
      ) : null}
      {university.programDetails?.length ? (
        <div className="mt-4 overflow-x-auto">
          <h2 className="mb-2 text-lg font-semibold">Program Fee Catalog</h2>
          <table className="table-card">
            <thead>
              <tr>
                <th>Level</th>
                <th>Program</th>
                <th>Lang</th>
                <th>Duration</th>
                <th>Base</th>
                <th>Installment</th>
                <th>Full Payment</th>
                <th>Scholarship</th>
              </tr>
            </thead>
            <tbody>
              {university.programDetails.map((item) => (
                <tr key={item.id}>
                  <td>{item.level}</td>
                  <td>{item.programName}</td>
                  <td>{item.language ?? "-"}</td>
                  <td>{item.durationYears ?? "-"}</td>
                  <td>{item.baseFee ? `${item.currency} ${item.baseFee}` : "-"}</td>
                  <td>{item.installmentFee ? `${item.currency} ${item.installmentFee}` : "-"}</td>
                  <td>{item.fullPaymentFee ? `${item.currency} ${item.fullPaymentFee}` : "-"}</td>
                  <td>{item.scholarshipFee ? `${item.currency} ${item.scholarshipFee}` : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
