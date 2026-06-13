const fs = require("fs");
const path = require("path");
const { PDFDocument } = require("pdf-lib");

const inputFolder = "/Users/ghritak/Documents/Docs/APSC/CA Printable/Internation Relations"; // folder with PDFs

async function processPDF(filePath) {
  const existingPdfBytes = fs.readFileSync(filePath);

  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const totalPages = pdfDoc.getPageCount();

  if (totalPages <= 2) {
    console.log(`Skipping ${path.basename(filePath)} (2 or fewer pages)`);
    return;
  }

  const newPdf = await PDFDocument.create();

  // Copy pages except first two
  const pagesToCopy = [];
  for (let i = 2; i < totalPages; i++) {
    pagesToCopy.push(i);
  }

  const copiedPages = await newPdf.copyPages(pdfDoc, pagesToCopy);
  copiedPages.forEach((page) => newPdf.addPage(page));

  const newPdfBytes = await newPdf.save();

  // 🔥 Overwrite original file
  fs.writeFileSync(filePath, newPdfBytes);

  console.log(`Updated: ${path.basename(filePath)}`);
}

async function main() {
  const files = fs.readdirSync(inputFolder);

  for (const file of files) {
    if (path.extname(file).toLowerCase() === ".pdf") {
      const inputPath = path.join(inputFolder, file);
      await processPDF(inputPath);
    }
  }

  console.log("All PDFs updated.");
}

main();