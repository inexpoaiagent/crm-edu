"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { fetchJson } from "@/lib/client/fetch-json";

type SearchResponse = {
  students: Array<{ id: string; fullName: string; stage: string }>;
  universities: Array<{ id: string; name: string; country: string }>;
  applications: Array<{ id: string; program: string; status: string }>;
};

export default function GlobalSearch() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResponse>({ students: [], universities: [], applications: [] });
  const [open, setOpen] = useState(false);

  const hasResults = useMemo(
    () => results.students.length + results.universities.length + results.applications.length > 0,
    [results],
  );

  useEffect(() => {
    const handler = setTimeout(async () => {
      const q = query.trim();
      if (q.length < 2) {
        setResults({ students: [], universities: [], applications: [] });
        return;
      }
      const { response, data } = await fetchJson<SearchResponse>(`/api/search?q=${encodeURIComponent(q)}`);
      if (!response.ok || !data) return;
      setResults(data);
    }, 250);
    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="relative w-full max-w-lg">
      <input
        ref={inputRef}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search students, universities, applications..."
        className="w-full rounded-xl border border-border bg-white px-4 py-2 text-sm"
      />
      {open && query.trim().length >= 2 ? (
        <div className="absolute left-0 top-[calc(100%+8px)] z-20 w-full rounded-2xl border border-border bg-white p-3 shadow-2xl">
          {hasResults ? (
            <div className="space-y-3 text-sm">
              {results.students.length ? (
                <div>
                  <p className="mb-1 text-xs uppercase tracking-wide text-muted">Students</p>
                  {results.students.map((item) => (
                    <Link key={item.id} href={`/students/${item.id}`} className="block rounded-lg px-2 py-1 hover:bg-secondary" onClick={() => setOpen(false)}>
                      {item.fullName} <span className="text-xs text-muted">({item.stage})</span>
                    </Link>
                  ))}
                </div>
              ) : null}
              {results.universities.length ? (
                <div>
                  <p className="mb-1 text-xs uppercase tracking-wide text-muted">Universities</p>
                  {results.universities.map((item) => (
                    <Link key={item.id} href={`/universities/${item.id}`} className="block rounded-lg px-2 py-1 hover:bg-secondary" onClick={() => setOpen(false)}>
                      {item.name} <span className="text-xs text-muted">({item.country})</span>
                    </Link>
                  ))}
                </div>
              ) : null}
              {results.applications.length ? (
                <div>
                  <p className="mb-1 text-xs uppercase tracking-wide text-muted">Applications</p>
                  {results.applications.map((item) => (
                    <Link key={item.id} href={`/applications/${item.id}`} className="block rounded-lg px-2 py-1 hover:bg-secondary" onClick={() => setOpen(false)}>
                      {item.program} <span className="text-xs text-muted">({item.status})</span>
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-muted">No results found.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
