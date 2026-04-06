import Link from "next/link";

const stats = [
  { label: "Active Students", value: "1,248", delta: "+12% MoM" },
  { label: "Applications", value: "523", delta: "+8 new" },
  { label: "Revenue", value: "₺8.4M", delta: "+17%" },
  { label: "Docs Verified", value: "312", delta: "98% accuracy" },
];

const students = [
  { name: "Sema Aydin", stage: "ENROLLED", agent: "Agent Cem" },
  { name: "Omar Baykara", stage: "OFFERED", agent: "Agent Leyla" },
  { name: "Meriç Güler", stage: "APPLIED", agent: "Agent Cem" },
  { name: "Darya Reza", stage: "LEAD", agent: "Agent Mauro" },
];

const documents = [
  { label: "Passport", status: "Verified", count: 112 },
  { label: "Diploma", status: "Uploaded", count: 98 },
  { label: "Transcript", status: "Missing", count: 24 },
  { label: "English Cert", status: "Verified", count: 76 },
];

const tasks = [
  { title: "Follow up with Sabah", due: "Today", status: "TODO" },
  { title: "Review Sabir's documents", due: "Tomorrow", status: "IN_PROGRESS" },
  { title: "Verify EC for Darya", due: "Overdue", status: "OVERDUE" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-10">
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card">
            <div className="text-sm text-muted">{stat.label}</div>
            <div className="text-3xl font-semibold">{stat.value}</div>
            <div className="text-xs text-success">{stat.delta}</div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Student pipeline</p>
              <h2 className="text-xl font-semibold">Lead → Enrolled funnel</h2>
            </div>
            <Link href="/students" className="btn-ghost text-xs uppercase">
              View list
            </Link>
          </div>
          <div className="mt-6 space-y-3">
            {students.map((student) => (
              <div key={student.name} className="flex items-center justify-between border-b border-border py-2">
                <div>
                  <strong>{student.name}</strong>
                  <p className="text-xs text-muted">{student.agent}</p>
                </div>
                <span className="badge">{student.stage}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card glass-card">
          <div className="text-sm text-muted">Document status</div>
          <div className="mt-4 space-y-5">
            {documents.map((doc) => (
              <div key={doc.label} className="flex items-center justify-between">
                <div>
                  <div className="text-base font-semibold">{doc.label}</div>
                  <div className="text-xs text-muted">{doc.status}</div>
                </div>
                <div className="text-xl font-bold">{doc.count}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="card space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted">Tasks & reminders</p>
            <h2 className="text-xl font-semibold">Today / Upcoming</h2>
          </div>
          <Link href="/tasks" className="btn-ghost text-xs uppercase">
            Open board
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {tasks.map((task) => (
            <div key={task.title} className="rounded-2xl border border-border p-4">
              <div className="text-xs text-muted">Due {task.due}</div>
              <h3 className="text-lg font-semibold">{task.title}</h3>
              <div className="badge mt-3">{task.status}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted">Matching engine</p>
            <h2 className="text-xl font-semibold">Recommended universities for leads</h2>
          </div>
          <button className="btn-solid text-white">Run matching</button>
        </div>
        <div className="mt-6 w-full overflow-hidden rounded-2xl border border-border">
          <table className="table-card w-full bg-transparent">
            <thead>
              <tr>
                <th>University</th>
                <th>Program</th>
                <th>Fit</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Beykent University</td>
                <td>Computer Science</td>
                <td>GPA 3.5 · Budget Friendly</td>
                <td>
                  <span className="badge">Recommended</span>
                </td>
              </tr>
              <tr>
                <td>Near East University</td>
                <td>Business Analytics</td>
                <td>English · Spring Intake</td>
                <td>
                  <span className="badge">Track</span>
                </td>
              </tr>
              <tr>
                <td>Eastern Mediterranean</td>
                <td>Mechanical Engineering</td>
                <td>Budget ok · Low deadline risk</td>
                <td>
                  <span className="badge">Watch</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
