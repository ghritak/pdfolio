const fs = require("fs");
const path = require("path");

// Static folder path
const folder = "/Users/ghritak/Documents/Docs/APSC/Current Affairs Revision Mains/Polity";

fs.readdir(folder, (err, files) => {
  if (err) {
    console.error("Error reading folder:", err);
    return;
  }

  files.forEach((file) => {
    if (
      file.endsWith(".pdf") &&
      file.startsWith("Current Affairs Revision ")
    ) {
      const newName = file.replace("Current Affairs Revision ", "");

      const oldPath = path.join(folder, file);
      const newPath = path.join(folder, newName);

      fs.rename(oldPath, newPath, (err) => {
        if (err) {
          console.error(`Error renaming ${file}:`, err);
        } else {
          console.log(`Renamed: ${file} → ${newName}`);
        }
      });
    }
  });
});