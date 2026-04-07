"use client";

import { useEffect, useMemo, useState } from "react";
import GlobalSearch from "./global-search";
import { fetchJson } from "@/lib/client/fetch-json";

type Me = { user: { name: string; role: string; unreadNotifications: number } };
type Notification = { id: string; title: string; message: string; read: boolean; createdAt: string };

export default function TopbarActions() {
  const [me, setMe] = useState<Me["user"] | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  async function load() {
    const [meRes, notiRes] = await Promise.all([
      fetchJson<Me>("/api/auth/me"),
      fetchJson<{ notifications: Notification[] }>("/api/notifications"),
    ]);
    if (meRes.response.ok) setMe(meRes.data?.user ?? null);
    if (notiRes.response.ok) setNotifications(notiRes.data?.notifications ?? []);
  }

  useEffect(() => {
    void load();
    const root = document.documentElement;
    const darkValue = localStorage.getItem("crm_dark_mode");
    const enabled = darkValue === "1";
    setDarkMode(enabled);
    root.classList.toggle("crm-dark", enabled);
    const fontScale = localStorage.getItem("crm_font_scale") || "md";
    root.classList.remove("crm-font-sm", "crm-font-md", "crm-font-lg");
    root.classList.add(`crm-font-${fontScale}`);
  }, []);

  const unread = useMemo(() => notifications.filter((item) => !item.read).length, [notifications]);

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  }

  function toggleDarkMode() {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("crm_dark_mode", next ? "1" : "0");
    document.documentElement.classList.toggle("crm-dark", next);
  }

  function openCommandPalette() {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }));
  }

  return (
    <div className="flex w-full max-w-4xl items-center justify-end gap-2">
      <GlobalSearch />
      <div className="relative">
        <button className="btn-ghost icon-btn relative flex h-10 w-10 items-center justify-center p-0 text-text" type="button" onClick={() => setOpen((prev) => !prev)} title="Notifications">
          <span className="text-base leading-none">🔔</span>
          {unread ? <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-white">{unread}</span> : null}
        </button>
        {open ? (
          <div className="topbar-surface absolute right-0 top-[calc(100%+8px)] z-30 w-96 rounded-2xl border border-border p-3 shadow-2xl">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold">Notifications</p>
              <button className="text-xs text-primary underline" type="button" onClick={markAllRead}>
                Mark all read
              </button>
            </div>
            <div className="max-h-80 space-y-2 overflow-y-auto">
              {notifications.map((item) => (
                <article key={item.id} className={`rounded-xl border p-2 ${item.read ? "border-border" : "border-primary/40 bg-secondary"}`}>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted">{item.message}</p>
                  <p className="mt-1 text-[11px] text-muted">{new Date(item.createdAt).toLocaleString()}</p>
                </article>
              ))}
              {!notifications.length ? <p className="text-sm text-muted">No notifications yet.</p> : null}
            </div>
          </div>
        ) : null}
      </div>
      <button className="btn-ghost icon-btn flex h-10 w-10 items-center justify-center p-0 text-text" type="button" onClick={openCommandPalette} title="Search (Ctrl/Cmd + K)">
        <span className="text-base leading-none">⌕</span>
      </button>
      <button className="btn-ghost icon-btn flex h-10 w-10 items-center justify-center p-0 text-text" type="button" onClick={toggleDarkMode} title={darkMode ? "Light mode" : "Dark mode"}>
        <span className="text-base leading-none">{darkMode ? "☀" : "☾"}</span>
      </button>
      <div className="topbar-chip rounded-full border border-border px-3 py-1 text-xs font-semibold text-text">
        {me?.name ?? "User"} - {me?.role ?? "Role"}
      </div>
      <form action="/api/auth/logout" method="post">
        <button className="btn-ghost icon-btn flex h-10 w-10 items-center justify-center p-0 text-text" type="submit" title="Logout">
          <span className="text-base leading-none">⎋</span>
        </button>
      </form>
    </div>
  );
}
