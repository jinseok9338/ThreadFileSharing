// scripts/sortCsv.ts

import * as csv from "fast-csv";
import * as fs from "fs";
import * as path from "path";

const csvFile = process.argv[2] || "language.csv";
const csvPath = path.join(process.cwd(), csvFile);

// Read and sort the CSV file
const rows: any[] = [];

fs.createReadStream(csvPath)
  .pipe(csv.parse({ headers: true }))
  .on("data", (row) => {
    rows.push(row);
  })
  .on("end", () => {
    // Sort the rows by category then key
    rows.sort((a, b) => {
      const categoryComparison = a.category.localeCompare(b.category);
      if (categoryComparison === 0) {
        return a.key.localeCompare(b.key);
      }
      return categoryComparison;
    });

    // Write sorted data back to the file
    const writableStream = fs.createWriteStream(csvPath);
    csv
      .write(rows, { headers: true })
      .pipe(writableStream)
      .on("finish", () => {
        console.log("CSV file has been sorted successfully");
      })
      .on("error", (error) => {
        console.error("Error writing sorted CSV:", error);
        process.exit(1);
      });
  })
  .on("error", (error) => {
    console.error("Error reading CSV:", error);
    process.exit(1);
  });
