"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Student = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  stage: string;
  fieldOfStudy: string;
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    nationality: "",
    fieldOfStudy: "",
    englishLevel: "",
    username: "",
    password: "",
  });

  async function loadStudents() {
    setLoading(true);
    const response = await fetch("/api/students");
    const payload = (await response.json()) as { students: Student[] };
    setStudents(payload.students ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void loadStudents();
  }, []);

  async function createStudent(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (response.ok) {
      setForm({
        fullName: "",
        email: "",
        phone: "",
        nationality: "",
        fieldOfStudy: "",
        englishLevel: "",
        username: "",
        password: "",
      });
      await loadStudents();
    }
  }

  return (
    <div className="space-y-6">
      <section className="card">
        <h1 className="text-2xl font-semibold">Students</h1>
        <p className="mt-2 text-sm text-muted">Tenant-scoped student pipeline with full CRUD.</p>
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold">Add student</h2>
        <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={createStudent}>
          {Object.entries(form).map(([key, value]) => (
            <label key={key} className="text-sm text-muted">
              {key}
              <input
                type={key.includes("password") ? "password" : "text"}
                className="mt-1 w-full rounded-xl border border-border px-3 py-2"
                value={value}
                onChange={(event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))}
              />
            </label>
          ))}
          <button className="btn-solid md:col-span-2" type="submit">
            Create student
          </button>
        </form>
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold">Student list</h2>
        {loading ? (
          <p className="mt-3 text-sm text-muted">Loading...</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="table-card">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Stage</th>
                  <th>Field</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <Link href={`/students/${student.id}`} className="text-primary underline">
                        {student.fullName}
                      </Link>
                    </td>
                    <td>{student.email}</td>
                    <td>{student.phone}</td>
                    <td>{student.stage}</td>
                    <td>{student.fieldOfStudy}</td>
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
