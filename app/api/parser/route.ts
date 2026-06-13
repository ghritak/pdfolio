import axios from "axios";
import * as cheerio from "cheerio";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { url } = await request.json();

  if (!url || typeof url !== "string") {
    return Response.json({ error: "URL is required" }, { status: 400 });
  }

  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  const table = $(".waffle");

  if (!table.length) {
    return Response.json({ error: "No .waffle table found on this page" }, { status: 422 });
  }

  const headers: string[] = [];
  table.find("thead th").each((i, el) => {
    if (i > 0) headers.push($(el).text().trim());
  });

  const rows: Record<string, string>[] = [];
  table.find("tbody tr").each((_, row) => {
    const rowData: Record<string, string> = {};
    $(row).find("td").each((i, cell) => {
      if (i > 0) rowData[headers[i - 1]] = $(cell).text().trim();
    });
    rows.push(rowData);
  });

  return Response.json({ headers, rows, count: rows.length });
}
