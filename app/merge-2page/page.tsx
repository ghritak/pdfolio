"use client";
import { useState, useRef } from "react";
import Link from "next/link";

export default function Merge2PagePage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = Array.from(e.dataTransfer.files).find((f) =>
      f.name.toLowerCase().endsWith(".pdf")
    );
    if (f) setFile(f);
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  }

  async function handleSubmit() {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/merge-2page", { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "2-per-page.pdf";
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
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-1">2 Slides per A4 Page</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">
          Compress a PDF so two source pages appear on each A4 sheet — great for printing slide decks.
        </p>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-10 text-center cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors mb-4"
        >
          {file ? (
            <p className="text-zinc-700 dark:text-zinc-300 font-medium">{file.name}</p>
          ) : (
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              Drag & drop a PDF here, or <span className="underline">click to browse</span>
            </p>
          )}
          <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={handleInput} />
        </div>

        {file && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm flex items-center justify-between mb-4">
            <span className="text-zinc-700 dark:text-zinc-300 truncate">{file.name}</span>
            <button onClick={() => setFile(null)} className="text-zinc-400 hover:text-red-500 ml-3">✕</button>
          </div>
        )}

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={!file || loading}
          className="w-full h-11 rounded-full bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 font-medium disabled:opacity-40 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
        >
          {loading ? "Processing…" : "Convert"}
        </button>
      </div>
    </div>
  );
}
