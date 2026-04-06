"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Student = {
  id: string;
  fullName: string;
  nationality: string;
  stage: "LEAD" | "APPLIED" | "OFFERED" | "ENROLLED";
};

const columns: Array<{ key: Student["stage"]; label: string }> = [
  { key: "LEAD", label: "Lead" },
  { key: "APPLIED", label: "Applied" },
  { key: "OFFERED", label: "Accepted" },
  { key: "ENROLLED", label: "Enrolled" },
];

export default function PipelinePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  async function load() {
    const response = await fetch("/api/students?limit=200");
    const payload = (await response.json()) as { students: Student[] };
    setStudents(payload.students ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function moveStudent(studentId: string, stage: Student["stage"]) {
    setStudents((prev) => prev.map((item) => (item.id === studentId ? { ...item, stage } : item)));
    await fetch(`/api/students/${studentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage }),
    });
  }

  const grouped = useMemo(
    () =>
      columns.map((column) => ({
        ...column,
        students: students.filter((student) => student.stage === column.key),
      })),
    [students],
  );

  return (
    <div className="space-y-6">
      <section className="card">
        <h1 className="text-2xl font-semibold">Pipeline Board</h1>
        <p className="mt-2 text-sm text-muted">Drag and drop students through the pipeline.</p>
      </section>
      <section className="grid gap-4 xl:grid-cols-4">
        {grouped.map((column) => (
          <div
            key={column.key}
            className="card min-h-[420px]"
            onDragOver={(event) => event.preventDefault()}
            onDrop={async () => {
              if (!draggingId) return;
              await moveStudent(draggingId, column.key);
              setDraggingId(null);
            }}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{column.label}</h2>
              <span className="badge">{column.students.length}</span>
            </div>
            <div className="space-y-3">
              {column.students.map((student) => (
                <article
                  key={student.id}
                  className="rounded-2xl border border-border bg-white p-3 shadow-sm"
                  draggable
                  onDragStart={() => setDraggingId(student.id)}
                >
                  <Link href={`/students/${student.id}`} className="font-semibold text-text hover:underline">
                    {student.fullName}
                  </Link>
                  <p className="mt-1 text-xs text-muted">{student.nationality}</p>
                </article>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
