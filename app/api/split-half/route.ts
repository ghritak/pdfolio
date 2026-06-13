import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
import { NextRequest } from "next/server";

async function splitPdf(bytes: ArrayBuffer): Promise<Uint8Array> {
  const srcPdf = await PDFDocument.load(bytes);
  const srcPages = srcPdf.getPages();

  if (srcPages.length === 0) throw new Error("PDF has no pages");

  const outPdf = await PDFDocument.create();

  for (const srcPage of srcPages) {
    const { width: W, height: H } = srcPage.getSize();
    const halfH = H / 2;

    const topEmbedded = await outPdf.embedPage(srcPage, {
      left: 0,
      bottom: halfH,
      right: W,
      top: H,
    });

    const bottomEmbedded = await outPdf.embedPage(srcPage, {
      left: 0,
      bottom: 0,
      right: W,
      top: halfH,
    });

    const topPage = outPdf.addPage([W, halfH]);
    topPage.drawPage(topEmbedded, { x: 0, y: 0, width: W, height: halfH });

    const bottomPage = outPdf.addPage([W, halfH]);
    bottomPage.drawPage(bottomEmbedded, { x: 0, y: 0, width: W, height: halfH });
  }

  return outPdf.save();
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const files = formData.getAll("files") as File[];

  if (!files.length) {
    return new Response("No files provided", { status: 400 });
  }

  if (files.length === 1) {
    const pdfBytes = await splitPdf(await files[0].arrayBuffer());
    return new Response(pdfBytes.buffer as ArrayBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${files[0].name.replace(/\.pdf$/i, "")}-split.pdf"`,
      },
    });
  }

  const zip = new JSZip();

  for (const file of files) {
    const pdfBytes = await splitPdf(await file.arrayBuffer());
    const outName = file.name.replace(/\.pdf$/i, "") + "-split.pdf";
    zip.file(outName, pdfBytes);
  }

  const zipBytes = await zip.generateAsync({ type: "nodebuffer" });

  return new Response(zipBytes.buffer as ArrayBuffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="split-half.zip"',
    },
  });
}
