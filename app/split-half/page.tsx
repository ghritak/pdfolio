"use client";
import { useState, useRef } from "react";
import Link from "next/link";

export default function SplitHalfPage() {
  const [files, setFiles] = useState<File[]>([]);
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

  async function handleSubmit() {
    if (!files.length) return;
    setLoading(true);
    setError("");
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append("files", f));
      const res = await fetch("/api/split-half", { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        files.length === 1
          ? files[0].name.replace(/\.pdf$/i, "") + "-split.pdf"
          : "split-half.zip";
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
        <Link
          href="/"
          className="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 mb-6 inline-block"
        >
          ← Back
        </Link>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
          Split Pages in Half
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">
          Each page is sliced horizontally into two. A W×H page becomes two W×H/2 pages.
          Multiple PDFs are exported as a ZIP, each split separately.
        </p>

        {/* Visual diagram */}
        <div className="flex items-center gap-6 mb-8 justify-center select-none">
          <div className="flex flex-col items-center gap-1">
            <div className="w-16 h-24 border-2 border-zinc-400 dark:border-zinc-500 rounded flex flex-col overflow-hidden">
              <div className="flex-1 bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-[10px] text-zinc-500">top</div>
              <div className="border-t border-dashed border-zinc-400 dark:border-zinc-500" />
              <div className="flex-1 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-500">btm</div>
            </div>
            <span className="text-xs text-zinc-400">source page</span>
          </div>
          <span className="text-zinc-400 text-lg">→</span>
          <div className="flex gap-2">
            <div className="flex flex-col items-center gap-1">
              <div className="w-16 h-12 border-2 border-zinc-400 dark:border-zinc-500 rounded bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-[10px] text-zinc-500">
                top
              </div>
              <span className="text-xs text-zinc-400">page 1</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-16 h-12 border-2 border-zinc-400 dark:border-zinc-500 rounded bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-500">
                btm
              </div>
              <span className="text-xs text-zinc-400">page 2</span>
            </div>
          </div>
        </div>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-10 text-center cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors mb-4"
        >
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            Drag & drop PDFs here, or{" "}
            <span className="underline">click to browse</span>
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            multiple
            className="hidden"
            onChange={handleInput}
          />
        </div>

        {files.length > 0 && (
          <ul className="mb-4 space-y-1">
            {files.map((f, i) => (
              <li
                key={i}
                className="flex items-center justify-between bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm"
              >
                <span className="text-zinc-700 dark:text-zinc-300 truncate">{f.name}</span>
                <button
                  onClick={() => remove(i)}
                  className="text-zinc-400 hover:text-red-500 ml-3 shrink-0"
                >
                  ✕
                </button>
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
          {loading
            ? "Processing…"
            : files.length > 1
            ? `Split ${files.length} PDFs → ZIP`
            : "Split"}
        </button>
      </div>
    </div>
  );
}
