const statuses = [
  { label: "Documents", value: "Uploaded", detail: "3 / 5 verified" },
  { label: "Applications", value: "In progress", detail: "2 awaiting review" },
  { label: "Deadline", value: "April 20", detail: "Visa docs + deposit" },
];

const timeline = [
  { title: "Submit Passport", status: "Uploaded", time: "2d ago" },
  { title: "Document verification", status: "Pending", time: "Today" },
  { title: "University interview", status: "Scheduled", time: "Coming week" },
];

export default function StudentPortalHome() {
  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl">
        <div className="flex flex-col gap-3">
          <p className="text-sm uppercase tracking-[0.6em] text-white/60">Welcome back</p>
          <h1 className="text-3xl font-semibold text-white">Sema Aydin</h1>
          <p className="text-sm text-white/70">You are 78% ready for your spring intake.</p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {statuses.map((status) => (
            <div key={status.label} className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <div className="text-xs uppercase tracking-[0.3em] text-white/40">{status.label}</div>
              <div className="text-2xl font-semibold text-white">{status.value}</div>
              <div className="text-xs text-white/60">{status.detail}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-[1.2fr,1fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Applications timeline</h2>
            <span className="text-xs text-white/60">Updated 1h ago</span>
          </div>
          <div className="mt-6 space-y-4">
            {timeline.map((item) => (
              <div key={item.title} className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3">
                <div>
                  <p className="text-base font-semibold text-white">{item.title}</p>
                  <p className="text-xs text-white/60">{item.status}</p>
                </div>
                <div className="text-xs text-white/60">{item.time}</div>
              </div>
            ))}
          </div>
          <button className="btn-ghost mt-6 w-full text-center text-xs uppercase">Upload a document</button>
        </div>
        <div className="rounded-3xl border border-white/10 bg-black/40 p-6 shadow-2xl">
          <p className="text-sm text-white/60">Upcoming reminders</p>
          <ul className="mt-4 space-y-3 text-white/80">
            <li className="flex items-center justify-between">
              <span>Submit deposit for Near East</span>
              <span className="text-xs text-success">Due Apr 12</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Schedule English interview</span>
              <span className="text-xs text-warning">Due Apr 14</span>
            </li>
          </ul>
          <button className="btn-solid mt-6 w-full text-white">Messaging with agent</button>
        </div>
      </section>
    </div>
  );
}
