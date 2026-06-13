"use client";
import { useState, useRef } from "react";
import Link from "next/link";

export default function RenamePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [prefix, setPrefix] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files).filter((f) =>
      f.name.toLowerCase().endsWith(".pdf")
    );
    setFiles((prev) => [...prev, ...dropped]);
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    setFiles((prev) => [...prev, ...selected]);
  }

  function remove(i: number) {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
  }

  function preview(name: string) {
    if (!prefix) return name;
    return name.replace(prefix, "");
  }

  async function handleSubmit() {
    if (!files.length) return;
    setLoading(true);
    setError("");
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append("files", f));
      fd.append("prefix", prefix);
      const res = await fetch("/api/rename", { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = files.length === 1 ? preview(files[0].name) : "renamed.zip";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 mb-6 inline-block">
          ← Back
        </Link>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-1">Batch Rename PDFs</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">
          Strip a prefix string from PDF filenames. Multiple files are returned as a ZIP.
        </p>

        <div className="mb-5">
          <label className="text-sm text-zinc-600 dark:text-zinc-400 block mb-1">Prefix to remove</label>
          <input
            type="text"
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
            placeholder='e.g. "Current Affairs Revision "'
            className="w-full h-10 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
          />
        </div>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-10 text-center cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors mb-4"
        >
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            Drag & drop PDFs here, or <span className="underline">click to browse</span>
          </p>
          <input ref={inputRef} type="file" accept=".pdf" multiple className="hidden" onChange={handleInput} />
        </div>

        {files.length > 0 && (
          <ul className="mb-4 space-y-1">
            {files.map((f, i) => (
              <li key={i} className="flex items-center justify-between bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm">
                <div className="min-w-0 flex-1">
                  <span className="text-zinc-400 line-through truncate block">{f.name}</span>
                  <span className="text-zinc-700 dark:text-zinc-300 truncate block">{preview(f.name)}</span>
                </div>
                <button onClick={() => remove(i)} className="text-zinc-400 hover:text-red-500 ml-3 shrink-0">✕</button>
              </li>
            ))}
          </ul>
        )}

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={!files.length || loading}
          className="w-full h-11 rounded-full bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 font-medium disabled:opacity-40 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
        >
          {loading ? "Processing…" : `Rename ${files.length} PDF${files.length !== 1 ? "s" : ""}`}
        </button>
      </div>
    </div>
  );
}
