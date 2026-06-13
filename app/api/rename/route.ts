import JSZip from "jszip";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const files = formData.getAll("files") as File[];
  const prefix = (formData.get("prefix") as string | null) ?? "";

  if (!files.length) {
    return new Response("No files provided", { status: 400 });
  }

  if (files.length === 1) {
    const newName = prefix ? files[0].name.replace(prefix, "") : files[0].name;
    const bytes = await files[0].arrayBuffer();
    return new Response(bytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${newName}"`,
      },
    });
  }

  const zip = new JSZip();

  for (const file of files) {
    const newName = prefix ? file.name.replace(prefix, "") : file.name;
    const bytes = await file.arrayBuffer();
    zip.file(newName, bytes);
  }

  const zipBytes = await zip.generateAsync({ type: "nodebuffer" });

  return new Response(zipBytes.buffer as ArrayBuffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="renamed.zip"',
    },
  });
}
