import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const files = formData.getAll("files") as File[];
  const countStr = formData.get("count") as string | null;
  const count = Math.max(1, parseInt(countStr ?? "2", 10));

  if (!files.length) {
    return new Response("No files provided", { status: 400 });
  }

  if (files.length === 1) {
    const bytes = await files[0].arrayBuffer();
    const src = await PDFDocument.load(bytes);
    const total = src.getPageCount();

    if (total <= count) {
      return new Response("PDF has too few pages to remove", { status: 400 });
    }

    const out = await PDFDocument.create();
    const indices = Array.from({ length: total - count }, (_, i) => i + count);
    const copied = await out.copyPages(src, indices);
    copied.forEach((p) => out.addPage(p));
    const pdfBytes = await out.save();

    return new Response(pdfBytes.buffer as ArrayBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${files[0].name}"`,
      },
    });
  }

  const zip = new JSZip();

  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const src = await PDFDocument.load(bytes);
    const total = src.getPageCount();

    if (total <= count) continue;

    const out = await PDFDocument.create();
    const indices = Array.from({ length: total - count }, (_, i) => i + count);
    const copied = await out.copyPages(src, indices);
    copied.forEach((p) => out.addPage(p));
    const pdfBytes = await out.save();
    zip.file(file.name, pdfBytes);
  }

  const zipBytes = await zip.generateAsync({ type: "nodebuffer" });

  return new Response(zipBytes.buffer as ArrayBuffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="processed.zip"',
    },
  });
}
