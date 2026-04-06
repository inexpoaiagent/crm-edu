"use client";

import { useEffect, useState } from "react";

type Task = {
  id: string;
  title: string;
  status: string;
  priority: string;
  deadline?: string;
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [form, setForm] = useState({ title: "", description: "", priority: "MEDIUM" });

  async function load() {
    const response = await fetch("/api/tasks");
    const payload = (await response.json()) as { tasks: Task[] };
    setTasks(payload.tasks ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function createTask(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (response.ok) {
      setForm({ title: "", description: "", priority: "MEDIUM" });
      await load();
    }
  }

  return (
    <div className="space-y-6">
      <section className="card">
        <h1 className="text-2xl font-semibold">Tasks and reminders</h1>
      </section>
      <section className="card">
        <form className="grid gap-3 md:grid-cols-3" onSubmit={createTask}>
          <label className="text-sm text-muted">
            Title
            <input className="mt-1 w-full rounded-xl border border-border px-3 py-2" value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} />
          </label>
          <label className="text-sm text-muted">
            Description
            <input className="mt-1 w-full rounded-xl border border-border px-3 py-2" value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} />
          </label>
          <label className="text-sm text-muted">
            Priority
            <select className="mt-1 w-full rounded-xl border border-border px-3 py-2" value={form.priority} onChange={(event) => setForm((prev) => ({ ...prev, priority: event.target.value }))}>
              <option>LOW</option>
              <option>MEDIUM</option>
              <option>HIGH</option>
              <option>CRITICAL</option>
            </select>
          </label>
          <button className="btn-solid md:col-span-3" type="submit">
            Create task
          </button>
        </form>
      </section>
      <section className="card">
        <ul className="space-y-3">
          {tasks.map((task) => (
            <li key={task.id} className="flex items-center justify-between rounded-xl border border-border px-3 py-2">
              <div>
                <div className="font-semibold">{task.title}</div>
                <div className="text-xs text-muted">
                  {task.priority} | {task.status}
                </div>
              </div>
              {task.status === "OVERDUE" ? <span className="text-xs text-danger">Overdue</span> : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
