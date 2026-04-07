"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchJson } from "@/lib/client/fetch-json";

type Student = {
  id: string;
  fullName: string;
  nationality: string;
  stage: "LEAD" | "APPLIED" | "OFFERED" | "ENROLLED";
  fieldOfStudy?: string;
};

const columns: Array<{ key: Student["stage"]; label: string; color: string }> = [
  { key: "LEAD", label: "Lead", color: "bg-slate-500" },
  { key: "APPLIED", label: "Applied", color: "bg-blue-500" },
  { key: "OFFERED", label: "Accepted", color: "bg-amber-500" },
  { key: "ENROLLED", label: "Enrolled", color: "bg-emerald-500" },
];

function shortName(name: string) {
  return name
    .split(" ")
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function PipelinePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<Student["stage"] | null>(null);
  const [query, setQuery] = useState("");
  const [swimlane, setSwimlane] = useState<"none" | "nationality">("none");
  const [wipLimit, setWipLimit] = useState(15);
  const [boardOrder, setBoardOrder] = useState<Record<string, string[]>>({});

  async function load() {
    const [studentsRes, orderRes] = await Promise.all([
      fetchJson<{ students: Student[] }>("/api/students?limit=300"),
      fetchJson<{ boardOrder: Record<string, string[]> }>("/api/pipeline/order"),
    ]);
    if (studentsRes.response.ok) setStudents(studentsRes.data?.students ?? []);
    if (orderRes.response.ok) setBoardOrder(orderRes.data?.boardOrder ?? {});
  }

  useEffect(() => {
    void load();
  }, []);

  async function moveStudent(studentId: string, stage: Student["stage"]) {
    setStudents((prev) => prev.map((item) => (item.id === studentId ? { ...item, stage } : item)));
    const response = await fetchJson(`/api/students/${studentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage }),
    });
    if (!response.response.ok) {
      await load();
      return;
    }
    const nextOrder = { ...boardOrder };
    const allStages = columns.map((column) => column.key);
    for (const currentStage of allStages) {
      nextOrder[currentStage] = (nextOrder[currentStage] ?? []).filter((id) => id !== studentId);
    }
    nextOrder[stage] = [...(nextOrder[stage] ?? []), studentId];
    setBoardOrder(nextOrder);
    await fetchJson("/api/pipeline/order", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ boardOrder: nextOrder }),
    });
  }

  const filteredStudents = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return students;
    return students.filter(
      (student) =>
        student.fullName.toLowerCase().includes(term) ||
        (student.nationality || "").toLowerCase().includes(term) ||
        (student.fieldOfStudy || "").toLowerCase().includes(term),
    );
  }, [students, query]);

  const grouped = useMemo(() => {
    return columns.map((column) => {
      const list = filteredStudents.filter((student) => student.stage === column.key);
      const order = boardOrder[column.key] ?? [];
      const sorted = [...list].sort((a, b) => {
        const aIndex = order.indexOf(a.id);
        const bIndex = order.indexOf(b.id);
        if (aIndex === -1 && bIndex === -1) return a.fullName.localeCompare(b.fullName);
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });
      return { ...column, students: sorted };
    });
  }, [filteredStudents, boardOrder]);

  return (
    <div className="space-y-6">
      <section className="card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Pipeline Board</h1>
            <p className="mt-2 text-sm text-muted">Trello-style drag and drop board for lead management.</p>
          </div>
          <input
            className="w-full max-w-xs rounded-xl border border-border px-3 py-2 text-sm"
            placeholder="Search students..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <select className="rounded-xl border border-border px-3 py-2 text-sm" value={swimlane} onChange={(event) => setSwimlane(event.target.value as "none" | "nationality")}>
            <option value="none">Swimlane: None</option>
            <option value="nationality">Swimlane: Nationality</option>
          </select>
          <input
            type="number"
            min={1}
            className="w-28 rounded-xl border border-border px-3 py-2 text-sm"
            value={wipLimit}
            onChange={(event) => setWipLimit(Number(event.target.value) || 15)}
          />
        </div>
      </section>

      <section className="overflow-x-auto pb-2">
        <div className="flex min-w-max gap-4">
          {grouped.map((column) => (
            <div
              key={column.key}
              className={`w-[320px] rounded-2xl border border-border bg-[#f8faff] p-3 shadow-sm ${dropTarget === column.key ? "ring-2 ring-primary/40" : ""}`}
              onDragOver={(event) => {
                event.preventDefault();
                setDropTarget(column.key);
              }}
              onDragLeave={() => setDropTarget(null)}
              onDrop={async () => {
                if (!draggingId) return;
                await moveStudent(draggingId, column.key);
                setDraggingId(null);
                setDropTarget(null);
              }}
            >
              <div className="mb-3 flex items-center justify-between rounded-xl bg-white px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${column.color}`} />
                  <h2 className="text-sm font-semibold">{column.label}</h2>
                </div>
                <span className="badge">{column.students.length}</span>
              </div>
              {column.students.length > wipLimit ? (
                <div className="mb-2 rounded-lg border border-amber-300 bg-amber-50 px-2 py-1 text-xs text-amber-800">
                  WIP limit exceeded ({column.students.length}/{wipLimit})
                </div>
              ) : null}

              <div className="max-h-[65vh] space-y-3 overflow-y-auto pr-1">
                {column.students.map((student) => (
                  <article
                    key={student.id}
                    className="cursor-grab rounded-2xl border border-border bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:cursor-grabbing"
                    draggable
                    onDragStart={() => setDraggingId(student.id)}
                    onDragEnd={() => {
                      setDraggingId(null);
                      setDropTarget(null);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-text">
                        {shortName(student.fullName)}
                      </div>
                      <div className="min-w-0">
                        <Link href={`/students/${student.id}`} className="line-clamp-1 font-semibold text-text hover:underline">
                          {student.fullName}
                        </Link>
                        <p className="mt-1 text-xs text-muted">
                          {student.nationality}
                          {student.fieldOfStudy ? ` • ${student.fieldOfStudy}` : ""}
                        </p>
                        {swimlane === "nationality" ? <p className="mt-1 text-[11px] text-primary">Lane: {student.nationality}</p> : null}
                        <div className="mt-2 flex gap-1">
                          {columns
                            .filter((item) => item.key !== student.stage)
                            .slice(0, 2)
                            .map((item) => (
                              <button
                                key={`${student.id}-${item.key}`}
                                className="rounded-md border border-border px-2 py-0.5 text-[10px] text-muted hover:bg-secondary"
                                type="button"
                                onClick={() => moveStudent(student.id, item.key)}
                              >
                                Move to {item.label}
                              </button>
                            ))}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
                {!column.students.length ? (
                  <div className="rounded-xl border border-dashed border-border bg-white/60 p-4 text-center text-xs text-muted">
                    No students
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
