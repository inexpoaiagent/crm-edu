"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type University = {
  id: string;
  name: string;
  country: string;
  website?: string;
  tuitionRange?: string;
  language: string;
  programs: string[];
  deadline?: string;
};

export default function UniversityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [university, setUniversity] = useState<University | null>(null);

  useEffect(() => {
    fetch(`/api/universities/${id}`)
      .then((response) => response.json())
      .then((payload: { university: University }) => setUniversity(payload.university));
  }, [id]);

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
    </div>
  );
}
