"use client";

import { useEffect, useState } from "react";

type DocumentRecord = {
  id: string;
  type: string;
  fileName: string;
  status: string;
  fileUrl: string;
};

export default function PortalDocumentsPage() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [type, setType] = useState("PASSPORT");
  const [file, setFile] = useState<File | null>(null);

  async function load() {
    const response = await fetch("/api/portal/documents");
    const payload = (await response.json()) as { documents: DocumentRecord[] };
    setDocuments(payload.documents ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function upload(event: React.FormEvent) {
    event.preventDefault();
    if (!file) return;
    const formData = new FormData();
    formData.set("type", type);
    formData.set("file", file);

    const response = await fetch("/api/portal/documents", { method: "POST", body: formData });
    if (response.ok) {
      setFile(null);
      await load();
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-semibold text-white">Documents</h1>
      </section>
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-semibold text-white">Upload document</h2>
        <form className="mt-4 grid gap-3 md:grid-cols-3" onSubmit={upload}>
          <label className="text-sm text-white/70">
            Type
            <select className="mt-1 w-full rounded-xl border border-white/20 bg-transparent px-3 py-2 text-white" value={type} onChange={(event) => setType(event.target.value)}>
              {["PASSPORT", "DIPLOMA", "TRANSCRIPT", "ENGLISH_CERTIFICATE", "PHOTO"].map((option) => (
                <option key={option} value={option} className="text-black">
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-white/70 md:col-span-2">
            File
            <input type="file" className="mt-1 w-full rounded-xl border border-white/20 bg-transparent px-3 py-2 text-white" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
          </label>
          <button className="btn-solid md:col-span-3" type="submit">
            Upload
          </button>
        </form>
      </section>
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <ul className="space-y-3">
          {documents.map((document) => (
            <li key={document.id} className="flex items-center justify-between rounded-xl border border-white/10 p-3 text-white">
              <div>
                <div className="font-semibold">{document.type}</div>
                <div className="text-xs text-white/60">{document.fileName}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full border border-white/30 px-3 py-1 text-xs">{document.status}</span>
                <a href={document.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-300 underline">
                  Open
                </a>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
