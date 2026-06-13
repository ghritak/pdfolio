"use strict";

const fs   = require("fs");
const path = require("path");
const { PDFDocument } = require("pdf-lib");

// ─── Configuration ────────────────────────────────────────────────────────────

// const FOLDER_PATH = "/Users/ghritak/Documents/Docs/APSC/CA Printable/Internation Relations"
const FOLDER_PATH = "/Users/ghritak/Downloads";
const INPUT_FILE  = `${FOLDER_PATH}/ilovepdf_merged - converted removed.pdf`;     // ← change this
const OUTPUT_FILE = `${FOLDER_PATH}/merged.pdf`;    // ← change this

// ─── Geometry constants ───────────────────────────────────────────────────────

const A4_W_PT = 595.28;
const A4_H_PT = 841.89;
const MARGIN  = 28.35;   // 10 mm — raise to ~36 for tighter printer margins

// ─── Derived geometry ─────────────────────────────────────────────────────────

const usableW = A4_W_PT - MARGIN * 2;
const usableH = A4_H_PT - MARGIN * 2;

function computeLayout(aspectRatio) {
  const slideW = usableW;
  const slideH = slideW / aspectRatio;
  const gap    = (usableH - slideH * 2) / 3;
  const y1     = MARGIN + gap;
  const y2     = y1 + slideH + gap;
  return { slideW, slideH, gap, y1, y2 };
}

function computeLayoutSingle(aspectRatio) {
  const slideW = usableW;
  const slideH = slideW / aspectRatio;
  const y1     = MARGIN + (usableH - slideH) / 2;
  return { slideW, slideH, y1 };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const log = (...args) =>
  process.stdout.write("[merge-pdf-a4] " + args.join(" ") + "\n");

const die = (msg) => {
  process.stderr.write("[merge-pdf-a4] ERROR: " + msg + "\n");
  process.exit(1);
};

function drawEmbedded(outPage, embedded, x, y, w, h) {
  const { width: srcW, height: srcH } = embedded;
  outPage.drawPage(embedded, {
    x,
    y,
    xScale : w / srcW,
    yScale : h / srcH,
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!fs.existsSync(INPUT_FILE)) die(`Input file not found: ${INPUT_FILE}`);

  log(`Loading: ${INPUT_FILE}`);
  const srcPdf   = await PDFDocument.load(fs.readFileSync(INPUT_FILE));
  const srcPages = srcPdf.getPages();
  const total    = srcPages.length;

  if (total === 0) die("The source PDF has no pages.");
  log(`Source pages: ${total}`);

  const { width: srcW, height: srcH } = srcPages[0].getSize();
  const aspectRatio = srcW / srcH;
  log(`Source size: ${srcW.toFixed(1)} × ${srcH.toFixed(1)} pt  (ratio ${aspectRatio.toFixed(4)})`);

  if (aspectRatio < 1) {
    log("WARNING: source pages appear to be portrait, not landscape.");
    log("         The script still works — output will be scaled accordingly.");
  }

  const layout       = computeLayout(aspectRatio);
  const layoutSingle = computeLayoutSingle(aspectRatio);

  log(`Slide area: ${layout.slideW.toFixed(1)} × ${layout.slideH.toFixed(1)} pt  gap: ${layout.gap.toFixed(1)} pt  margin: ${MARGIN} pt`);

  const outPdf      = await PDFDocument.create();
  const allEmbedded = await outPdf.embedPages(srcPages);
  const toBottomY   = (topY, h) => A4_H_PT - topY - h;
  const a4Count     = Math.ceil(total / 2);

  for (let i = 0; i < total; i += 2) {
    const pageLabel = Math.floor(i / 2) + 1;
    const outPage   = outPdf.addPage([A4_W_PT, A4_H_PT]);

    if (i + 1 < total) {
      log(`  A4 page ${pageLabel}: source ${i + 1} + ${i + 2}`);
      drawEmbedded(outPage, allEmbedded[i],     MARGIN, toBottomY(layout.y1, layout.slideH), layout.slideW, layout.slideH);
      drawEmbedded(outPage, allEmbedded[i + 1], MARGIN, toBottomY(layout.y2, layout.slideH), layout.slideW, layout.slideH);
    } else {
      log(`  A4 page ${pageLabel}: source ${i + 1}  (centred — odd total)`);
      drawEmbedded(outPage, allEmbedded[i], MARGIN, toBottomY(layoutSingle.y1, layoutSingle.slideH), layoutSingle.slideW, layoutSingle.slideH);
    }
  }

  log(`Writing: ${OUTPUT_FILE}`);
  fs.writeFileSync(OUTPUT_FILE, await outPdf.save());

  const mm = (pt) => (pt / 2.835).toFixed(1) + " mm";
  console.log(`
┌──────────────────────────────────────────────────────┐
│  merge-pdf-a4  ✓  Done                               │
├──────────────────────────────────────────────────────┤
│  Source pages    : ${String(total).padEnd(32)} │
│  A4 pages out    : ${String(a4Count).padEnd(32)} │
│  Output          : ${path.basename(OUTPUT_FILE).padEnd(32)} │
├──────────────────────────────────────────────────────┤
│  Geometry                                            │
│  A4 size         : 210 × 297 mm                      │
│  Margin          : ${mm(MARGIN).padEnd(32)} │
│  Slide width     : ${mm(layout.slideW).padEnd(32)} │
│  Slide height    : ${mm(layout.slideH).padEnd(32)} │
│  Each gap (×3)   : ${mm(layout.gap).padEnd(32)} │
└──────────────────────────────────────────────────────┘
`);
}

main().catch((err) => {
  process.stderr.write("[merge-pdf-a4] FATAL: " + err.message + "\n");
  process.exit(1);
});