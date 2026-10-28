import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const sourcePath = "data/msme-businesses.csv";
const outputPath = "outputs/01a1106f-bb4e-7e30-b75d-a46fecfd3ce1/GBL-MSME-directory.xlsx";
const downloadPath = "data/GBL-MSME-directory.xlsx";
const previewPath = "/private/tmp/GBL-MSME-directory-preview.png";

const csvText = await fs.readFile(sourcePath, "utf8");
const workbook = await Workbook.fromCSV(csvText, { sheetName: "MSME Directory" });
const sheet = workbook.worksheets.getItem("MSME Directory");
const used = sheet.getUsedRange();
const rowCount = used.values.length;

sheet.showGridLines = false;
sheet.freezePanes.freezeRows(1);
sheet.tabColor = "#62400c";

used.format.font = { name: "Arial", size: 10, color: "#333333" };
used.format.verticalAlignment = "top";

const header = sheet.getRange("A1:P1");
header.format = {
  fill: "#62400c",
  font: { name: "Arial", size: 10, bold: true, color: "#FFFFFF" },
  horizontalAlignment: "center",
  verticalAlignment: "center",
  wrapText: true,
  borders: { preset: "inside", style: "thin", color: "#FFFFFF" },
};
header.format.rowHeight = 34;

if (rowCount > 1) {
  const body = sheet.getRange(`A2:P${rowCount}`);
  body.format.wrapText = true;
  body.format.borders = {
    insideHorizontal: { style: "thin", color: "#E6DED2" },
    bottom: { style: "thin", color: "#E6DED2" },
  };
  body.format.rowHeight = 58;
  sheet.getRange(`J2:K${rowCount}`).format.numberFormat = '"R" #,##0';
  sheet.getRange(`O2:O${rowCount}`).format.numberFormat = '"R" #,##0';
  sheet.getRange(`G2:G${rowCount}`).format.numberFormat = "yyyy-mm-dd";
}

const widths = {
  A: 24, B: 25, C: 22, D: 22, E: 25, F: 26, G: 14, H: 55,
  I: 38, J: 14, K: 14, L: 38, M: 30, N: 36, O: 16, P: 24,
};
for (const [column, width] of Object.entries(widths)) {
  sheet.getRange(`${column}:${column}`).format.columnWidth = width;
}

const table = sheet.tables.add(`A1:P${rowCount}`, true, "MSMEDirectoryTable");
table.style = "TableStyleLight1";
table.showFilterButton = true;
table.showBandedRows = true;

sheet.getRange("F2:F500").dataValidation = {
  rule: {
    type: "list",
    values: [
      "Needs verification",
      "Current – verified",
      "Published programme story",
      "Paused",
      "Closed",
    ],
  },
};

sheet.getRange("F2:F500").conditionalFormats.add("containsText", {
  text: "Needs verification",
  format: { fill: "#F3E4CC", font: { color: "#62400c", bold: true } },
});
sheet.getRange("F2:F500").conditionalFormats.add("containsText", {
  text: "Current – verified",
  format: { fill: "#F8F4EE", font: { color: "#62400c", bold: true } },
});

workbook.recalculate();

const inspection = await workbook.inspect({
  kind: "table",
  range: `MSME Directory!A1:P${rowCount}`,
  include: "values,formulas",
  tableMaxRows: 10,
  tableMaxCols: 16,
});
console.log(inspection.ndjson);

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!",
  options: { useRegex: true, maxResults: 100 },
  summary: "final formula error scan",
});
console.log(errors.ndjson);

const preview = await workbook.render({
  sheetName: "MSME Directory",
  range: `A1:P${rowCount}`,
  scale: 1.2,
  format: "png",
});
await fs.writeFile(previewPath, new Uint8Array(await preview.arrayBuffer()));

await fs.mkdir("outputs/01a1106f-bb4e-7e30-b75d-a46fecfd3ce1", { recursive: true });
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);
await output.save(downloadPath);

console.log(JSON.stringify({ outputPath, downloadPath, previewPath, rowCount }));
