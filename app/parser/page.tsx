"use client";
import { useState } from "react";
import Link from "next/link";

type ParseResult = {
  headers: string[];
  rows: Record<string, string>[];
  count: number;
};

export default function ParserPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ParseResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/parser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Unknown error");
      setResult(json);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function downloadJSON() {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result.rows, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "table-data.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 mb-6 inline-block">
          ← Back
        </Link>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-1">Google Sheets Table Parser</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">
          Paste a public Google Sheets "htmlview" URL to extract the table as JSON.
        </p>

        <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://docs.google.com/spreadsheets/d/.../htmlview"
            className="flex-1 h-10 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="h-10 px-5 rounded-full bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 font-medium text-sm disabled:opacity-40 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors shrink-0"
          >
            {loading ? "Fetching…" : "Parse"}
          </button>
        </form>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {result && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{result.count} rows · {result.headers.length} columns</p>
              <button
                onClick={downloadJSON}
                className="text-sm text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 rounded-full px-4 h-8 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Download JSON
              </button>
            </div>
            <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-sm">
                <thead className="bg-zinc-100 dark:bg-zinc-900">
                  <tr>
                    {result.headers.map((h) => (
                      <th key={h} className="px-3 py-2 text-left font-medium text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {result.rows.map((row, i) => (
                    <tr key={i} className="bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900">
                      {result.headers.map((h) => (
                        <td key={h} className="px-3 py-2 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                          {row[h] ?? ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
