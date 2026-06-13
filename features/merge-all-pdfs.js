"use strict";

const fs   = require("fs");
const path = require("path");
const { PDFDocument } = require("pdf-lib");

// ─── Configuration ────────────────────────────────────────────────────────────

const INPUT_FOLDER = "/Users/ghritak/Documents/Docs/APSC/CA Printable/Internation Relations";   // ← change this
const OUTPUT_FILE  = "/Users/ghritak/Documents/Docs/APSC/CA Printable/Internation Relations/output.pdf";    // ← change this

// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  if (!fs.existsSync(INPUT_FOLDER) || !fs.statSync(INPUT_FOLDER).isDirectory()) {
    console.error(`ERROR: Not a directory: ${INPUT_FOLDER}`);
    process.exit(1);
  }

  // Collect PDFs sorted by filename (case-insensitive, natural numeric order)
  const files = fs
    .readdirSync(INPUT_FOLDER)
    .filter(f => f.toLowerCase().endsWith(".pdf"))
    .sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
    )
    .map(f => path.join(INPUT_FOLDER, f));

  if (files.length === 0) {
    console.error(`ERROR: No PDF files found in: ${INPUT_FOLDER}`);
    process.exit(1);
  }

  console.log(`Found ${files.length} PDF(s) — merging in order:\n`);
  files.forEach((f, i) =>
    console.log(`  ${String(i + 1).padStart(3)}.  ${path.basename(f)}`)
  );
  console.log();

  const outPdf = await PDFDocument.create();
  let totalPages = 0;

  for (const file of files) {
    const srcPdf = await PDFDocument.load(fs.readFileSync(file), {
      ignoreEncryption: true,
    });
    const count  = srcPdf.getPageCount();
    const copied = await outPdf.copyPages(srcPdf, srcPdf.getPageIndices());
    copied.forEach(p => outPdf.addPage(p));
    totalPages += count;
    console.log(`  ✓  ${path.basename(file)}  (${count} page${count !== 1 ? "s" : ""})`);
  }

  fs.writeFileSync(OUTPUT_FILE, await outPdf.save());

  console.log(`
  Output : ${OUTPUT_FILE}
  Files  : ${files.length}
  Pages  : ${totalPages}
  Done ✓
`);
}

main().catch(err => {
  console.error("FATAL:", err.message);
  process.exit(1);
});