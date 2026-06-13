import Link from "next/link";

const tools = [
  {
    href: "/merge-all",
    title: "Merge All PDFs",
    description: "Combine multiple PDFs into one, sorted by filename.",
    icon: "⊕",
  },
  {
    href: "/merge-2page",
    title: "2 Slides per A4",
    description: "Fit two source pages onto each A4 sheet — ideal for printing slides.",
    icon: "⊞",
  },
  {
    href: "/remove-pages",
    title: "Remove Leading Pages",
    description: "Strip the first N pages from one or many PDFs.",
    icon: "⊟",
  },
  {
    href: "/rename",
    title: "Batch Rename PDFs",
    description: "Remove a common prefix from a batch of PDF filenames.",
    icon: "Aa",
  },
  {
    href: "/parser",
    title: "Google Sheets Parser",
    description: "Extract a table from a public Google Sheets page as JSON.",
    icon: "{}",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">PDFolio</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mb-10">A collection of PDF and data utilities.</p>

        <div className="grid gap-3">
          {tools.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="flex items-start gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors group"
            >
              <span className="text-xl font-mono text-zinc-400 dark:text-zinc-500 mt-0.5 w-8 shrink-0 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                {t.icon}
              </span>
              <div>
                <p className="font-medium text-zinc-900 dark:text-zinc-50">{t.title}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{t.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
