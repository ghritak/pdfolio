import { PDFDocument } from "pdf-lib";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const files = formData.getAll("files") as File[];

  if (!files.length) {
    return new Response("No files provided", { status: 400 });
  }

  const sorted = [...files].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" })
  );

  const outPdf = await PDFDocument.create();

  for (const file of sorted) {
    const bytes = await file.arrayBuffer();
    const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const copied = await outPdf.copyPages(src, src.getPageIndices());
    copied.forEach((p) => outPdf.addPage(p));
  }

  const pdfBytes = await outPdf.save();

  return new Response(pdfBytes.buffer as ArrayBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="merged.pdf"',
    },
  });
}
