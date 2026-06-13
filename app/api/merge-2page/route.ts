import { PDFDocument } from "pdf-lib";
import { NextRequest } from "next/server";

const A4_W = 595.28;
const A4_H = 841.89;
const MARGIN = 28.35;

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return new Response("No file provided", { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const srcPdf = await PDFDocument.load(bytes);
  const srcPages = srcPdf.getPages();
  const total = srcPages.length;

  if (total === 0) {
    return new Response("PDF has no pages", { status: 400 });
  }

  const { width: srcW, height: srcH } = srcPages[0].getSize();
  const aspect = srcW / srcH;
  const usableW = A4_W - MARGIN * 2;
  const usableH = A4_H - MARGIN * 2;
  const slideW = usableW;
  const slideH = slideW / aspect;
  const gap = (usableH - slideH * 2) / 3;
  const y1 = MARGIN + gap;
  const y2 = y1 + slideH + gap;
  const toBottom = (topY: number, h: number) => A4_H - topY - h;

  const outPdf = await PDFDocument.create();
  const embedded = await outPdf.embedPages(srcPages);

  for (let i = 0; i < total; i += 2) {
    const page = outPdf.addPage([A4_W, A4_H]);

    if (i + 1 < total) {
      page.drawPage(embedded[i], {
        x: MARGIN,
        y: toBottom(y1, slideH),
        xScale: slideW / srcW,
        yScale: slideH / srcH,
      });
      page.drawPage(embedded[i + 1], {
        x: MARGIN,
        y: toBottom(y2, slideH),
        xScale: slideW / srcW,
        yScale: slideH / srcH,
      });
    } else {
      const centredY = MARGIN + (usableH - slideH) / 2;
      page.drawPage(embedded[i], {
        x: MARGIN,
        y: toBottom(centredY, slideH),
        xScale: slideW / srcW,
        yScale: slideH / srcH,
      });
    }
  }

  const pdfBytes = await outPdf.save();

  return new Response(pdfBytes.buffer as ArrayBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="2-per-page.pdf"',
    },
  });
}
